"use server";

import { auth, signIn, signOut } from "@/app/_lib/auth";
import { supabase } from "@/app/_lib/supabase";
import { revalidatePath } from "next/cache";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  // console.log(formData);
  const session = await auth();
  //only if a logged in user can this action happen
  if (!session) throw new Error("You must be logged in");

  // nationality is a string which looks like this "country%countryflag"
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  const nationalID = formData.get("nationalID");

  //check the national ID is valid
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };
  // update the database - supabase

  // console.log(updateData);
  const { data, error } = await supabase
    .from("guests") // guests table
    .update(updateData) // send the updateData
    .eq("id", session.user.guestId); // find the matching id in db

  if (error) throw new Error("Guest could not be updated");

  // revidate the data in the cache
  revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function updateBooking(formData) {
  console.log(formData);

  const bookingId = Number(formData.get("bookingId"));
  // 1) Authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2) Authorization
  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  //  Building update data
  const updatedData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  // 4) Mutation
  const { error } = await supabase
    .from("bookings")
    .update(updatedData)
    .eq("id", bookingId)
    .select()
    .single();

  // 5) Error handling
  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }

  // 6) Revalidation
  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  // 7) Redirect
  redirect("/account/reservations");
}

export async function deleteBooking(bookingId) {
  // FOR TESTING
  // await new Promise((res) => setTimeout(res, 3000));
  // throw new Error("Couldn't delete reservation");

  // check for session
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
