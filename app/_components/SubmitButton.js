"use client";

import { useFormStatus } from "react-dom";
// to use useFormStatus hook - component needs to rendered in the form itself   // if this button was in a seperate file, it would have to be use client. Now, the form is usecliet. useFormStatus is on the client side.

export default function SubmitButton({ children, pendingText }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
      disabled={pending}
    >
      {pending ? pendingText : children}
    </button>
  );
}
