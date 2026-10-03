"use client";

export function DeleteMachineButton() {
  return (
    <button
      type="submit"
      className="btn btn-ghost btn-sm"
      onClick={(e) => {
        if (!window.confirm("Delete this machine and all of its photos? This cannot be undone.")) e.preventDefault();
      }}
    >
      Delete machine
    </button>
  );
}
