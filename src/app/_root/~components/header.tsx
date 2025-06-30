import UserAvatar from "./user-avatar";

export default function Header() {
  console.log("Header component rendered");

  return (
    <header className="flex justify-end gap-y-2 px-3 lg:px-6 py-2 lg:py-3 z-50">
      <UserAvatar />
    </header>
  );
}
