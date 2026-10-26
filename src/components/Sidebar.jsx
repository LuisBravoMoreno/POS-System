import Logo from "./Logo";
import "./Sidebar.css";

import {
  PlusCircle,
  ClipboardList,
  ChartColumn,
  Settings,
} from "lucide-react";

const navigationItems = [
  {
    id: "create-order",
    label: "CREATE ORDER",
    icon: PlusCircle,
  },
  {
    id: "orders-history",
    label: "ORDERS HISTORY",
    icon: ClipboardList,
  },
  {
    id: "reports",
    label: "REPORTS",
    icon: ChartColumn,
  },
  {
    id: "settings",
    label: "SETTINGS",
    icon: Settings,
  },
];

export default function Sidebar({
  activeSection = "create-order",
  onNavigate = () => {},
}) {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <Logo />
      </div>

      <nav
        className="sidebar-menu"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={
                isActive ? "active" : ""
              }
              aria-current={
                isActive ? "page" : undefined
              }
              onClick={() =>
                onNavigate(item.id)
              }
            >
              <Icon size={20} />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}