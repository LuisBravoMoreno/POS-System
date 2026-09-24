import Logo from "./Logo";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo />
      </div>

      <nav className="sidebar-menu">
        <button>Mesas</button>
        <button>Pedidos</button>
        <button>Productos</button>
        <button>Caja</button>
        <button>Reportes</button>
        <button>Configuración</button>
      </nav>
    </aside>
  );
}