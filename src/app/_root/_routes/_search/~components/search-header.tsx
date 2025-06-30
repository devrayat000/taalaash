import logoSingle from "@/assets/logo_single.png?url";
import SearchForm from "../search/~components/search-form";
import { Link } from "@tanstack/react-router";
import UserAvatar from "@/app/_root/~components/user-avatar";

export default function SearchHeader() {
  return (
    <header className="flex justify-between items-center gap-x-6 gap-y-2 px-3 h-20 lg:px-6 py-2 lg:py-3 z-50">
      <Link to="/" className="flex justify-center">
        <img src={logoSingle} alt="logo" width={120} />
      </Link>
      <div className="hidden lg:flex flex-1 items-center gap-2">
        <div className="flex-1">
          <SearchForm />
        </div>
      </div>
      <UserAvatar />
    </header>
  );
}
