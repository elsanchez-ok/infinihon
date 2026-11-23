import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

/**
 * Red de seguridad para toda la app: si algo revienta durante el render
 * (un dato inesperado, una página nueva con un bug, etc.), React desmonta
 * todo el árbol y deja la pantalla en blanco/negra sin ninguna pista — este
 * componente atrapa ese error y muestra un mensaje legible con un botón
 * para recargar, en vez de una pantalla negra sin explicación.
 *
 * Los estilos van inline a propósito: este es el único componente que debe
 * poder dibujarse incluso si el CSS de la app no cargó o algo más falló.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // eslint-disable-next-line no-console
    console.error("[InfiniHon Corp.] Error no controlado:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16, padding: 24, textAlign: "center",
        background: "#0B0D12", color: "#F5F7FA", fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B96A5" }}>
          InfiniHon Corp. — Control Center
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Algo salió mal al cargar esta pantalla.</h1>
        <p style={{ margin: 0, maxWidth: 440, color: "#8B96A5", fontSize: 14, lineHeight: 1.6 }}>
          No es tu conexión ni tu sesión — hubo un error inesperado en la aplicación.
          Recarga la página; si el problema sigue, contacta al equipo con este detalle:
        </p>
        <pre style={{
          margin: 0, maxWidth: 520, overflowX: "auto", padding: "10px 14px", borderRadius: 8,
          background: "rgba(255,255,255,0.06)", color: "#FF5C5C", fontSize: 12, textAlign: "left",
        }}>{this.state.error.message || String(this.state.error)}</pre>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8, padding: "12px 24px", borderRadius: 8, border: "none",
            background: "#0066FF", color: "#F5F7FA", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }
}
