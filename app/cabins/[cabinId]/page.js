import Cabin from "@/app/_components/Cabin";
import Reservation from "@/app/_components/Reservation";
import Spinner from "@/app/_components/Spinner";
import { getCabin, getCabins } from "@/app/_lib/data-service";
import { Suspense } from "react";

export async function generateMetadata({ params }) {
  const { name, data } = await getCabin(params.cabinId);
  // console.log(data);

  return { title: `Cabin ${name}` };
}

// Tell next what params are going to be sent dynamically - the list of cabin ids - which params exist for the route
export async function generateStaticParams() {
  // get all cabins
  const cabins = await getCabins();
  // console.log(cabins);
  // loop over cabins ids
  const ids = cabins.map((cabin) => ({ cabinId: String(cabin.id) }));
  // console.log(ids);
  return ids;
}

export default async function Page({ params }) {
  const cabin = await getCabin(params.cabinId);

  cabin;

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <Cabin cabin={cabin} />
      <div>
        <h2 className="text-5xl font-semibold text-center mb-10  text-accent-400">
          Reserve {cabin.name} today. Pay on arrival.
        </h2>
        <Suspense fallback={<Spinner />}>
          <Reservation cabin={cabin} />
        </Suspense>
      </div>
    </div>
  );
}
