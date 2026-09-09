import { LogOut, Menu, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_ITEMS } from "./nav-items";

function initials(value?: string) {
  const first = value?.split("@")[0]?.replace(/[^a-z0-9]+/gi, " ").trim();
  if (!first) return "A";
  return first.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, logout } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const results = useMemo(
    () => ADMIN_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6),
    [query]
  );

  function goToFirstResult() {
    const first = results[0];
    if (!first) return;
    navigate(`/admin/${first.slug}`);
    setQuery("");
    setSearchOpen(false);
    searchRef.current?.blur();
  }

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <header className="mx-4 my-4 flex min-h-16 flex-none items-center gap-3 rounded-lg bg-canvas px-4 shadow-[var(--shadow-float)] sm:mx-6 lg:mx-7">
      <button type="button" onClick={onOpenMobile} aria-label="Open navigation" className="flex h-10 w-10 flex-none items-center justify-center rounded-md text-steel hover:bg-surface hover:text-ink md:hidden">
        <Menu size={20} />
      </button>

      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <Search size={20} className="flex-none text-steel" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
          onKeyDown={(event) => { if (event.key === "Enter") goToFirstResult(); }}
          aria-label="Search the back office"
          placeholder="Search navigation"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        <kbd className="hidden rounded border border-hairline bg-surface-soft px-2 py-1 text-[0.7rem] font-medium text-muted sm:inline">CTRL + K</kbd>
        {searchOpen && query.trim() && (
          <div className="absolute left-0 top-11 z-40 w-full max-w-md overflow-hidden rounded-lg bg-canvas py-2 shadow-xl">
            {results.length > 0 ? results.map((item) => (
              <button key={item.schemaName} type="button" onMouseDown={() => navigate(`/admin/${item.slug}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-steel hover:bg-surface hover:text-ink">
                <item.icon size={17} className="text-brand-accent" /> {item.label}
              </button>
            )) : <p className="px-4 py-3 text-sm text-muted">No matching section</p>}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        {user?.email && <span className="hidden max-w-44 truncate text-sm text-steel xl:inline">{user.email}</span>}
        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent-soft text-xs font-semibold text-brand-accent ring-2 ring-canvas">
          {initials(user?.email)}
        </div>
        <Button variant="ghost" size="sm" onClick={() => void logout()} title="Sign out" aria-label="Sign out" className="px-2">
          <LogOut size={17} />
        </Button>
      </div>
    </header>
  );
}
