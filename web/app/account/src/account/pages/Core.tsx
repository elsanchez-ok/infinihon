import { useState } from "react";
import {
  ArrowLeft, Bell, Boxes, Compass, CreditCard, FileText, Headphones, Heart, LifeBuoy, Package,
  Plus, Send, Settings2, ShieldCheck, Sparkles, User, Users,
} from "lucide-react";
import { useAccount, displayName } from "../store";
import { fmtDate, type PortalOrder } from "../data";
import {
  Button, DashboardCard, DemoNote, EmptyState, PageHeader, Panel, QuickAction, ResourceTable, SpaceDiagram, StatusBadge, type Column,
} from "../ui";

/* ─────────── Dashboard ─────────── */

export function DashboardPage() {
  const { data, navigate } = useAccount();
  const openRequests = data.requests.filter((r) => !["Completada", "Cancelada"].includes(r.status));
  const openTickets = data.tickets.filter((t) => !["Resuelto", "Cerrado"].includes(t.status));
  const unread = data.notifications.filter((n) => !n.read);
  const attention = [
    ...openRequests.map((r) => ({ id: r.id, label: r.title, meta: `Solicitud · ${r.status}`, to: `/account/requests/${r.id}` })),
    ...openTickets.filter((t) => t.status === "Esperándote").map((t) => ({ id: t.id, label: t.subject, meta: `Ticket · ${t.status}`, to: `/account/support/tickets/${t.id}` })),
    ...(!data.profileCompleted ? [{ id: "profile", label: "Completa tu perfil", meta: "Cuenta · acción recomendada", to: "/account/profile" }] : []),
    ...(data.security.twoFactor === "No configurado" ? [{ id: "2fa", label: "Configura la verificación en dos pasos", meta: "Seguridad · acción recomendada", to: "/account/security" }] : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Tu espacio"
        title={`Bienvenido de nuevo${data.profileCompleted ? `, ${data.profile.firstName}` : "."}`}
        description="Esto es lo que está pasando con tu cuenta de InfiniHon."
        actions={<Button variant="primary" icon={Plus} onClick={() => navigate("/account/requests/new")}>Solicitar un servicio</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardCard label="Servicios activos" value={0} state="empty" hint="Aún no tienes servicios contratados." icon={Boxes} to="/account/services" />
        <DashboardCard label="Pedidos" value={data.orders.length} state={data.orders.length ? "ok" : "empty"} hint={data.orders.length ? "Consulta el estado de tus compras." : "Tus compras aparecerán aquí."} icon={Package} to="/account/orders" />
        <DashboardCard label="Solicitudes abiertas" value={openRequests.length} hint={openRequests.length ? "En revisión o en progreso." : "No hay solicitudes abiertas."} icon={Send} to="/account/requests" />
        <DashboardCard label="Tickets de soporte" value={openTickets.length} hint={openTickets.length ? "Conversaciones activas con soporte." : "Sin conversaciones abiertas."} icon={LifeBuoy} to="/account/support/tickets" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Acciones rápidas" description="Lo que la mayoría de usuarios necesita primero.">
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction label="Explorar servicios" description="Descubre lo que InfiniHon puede implementar" icon={Compass} onClick={() => navigate("/account/favorites")} />
              <QuickAction label="Ver pedidos" description="Consulta el estado de tus compras" icon={Package} onClick={() => navigate("/account/orders")} />
              <QuickAction label="Solicitar un servicio" description="Cotización, implementación o cambio" icon={Send} onClick={() => navigate("/account/requests/new")} />
              <QuickAction label="Contactar soporte" description="Abre un ticket con el equipo" icon={Headphones} onClick={() => navigate("/account/support")} />
            </div>
          </Panel>

          <Panel title="Necesita tu atención" description="Elementos que requieren una acción de tu parte." padded={false}>
            {attention.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {attention.map((a) => (
                  <li key={a.id}>
                    <button onClick={() => navigate(a.to)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.02]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-volt" aria-hidden />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-snow">{a.label}</span><span className="block text-[11.5px] text-steel">{a.meta}</span></span>
                      <span className="text-steel"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Sparkles} title="Todo en orden." description="No hay nada pendiente de tu parte en este momento." />
            )}
          </Panel>

          <Panel title="Tu espacio InfiniHon" description="Vista conceptual de las áreas de tu cuenta.">
            <SpaceDiagram counts={{ services: 0, orders: data.orders.length, requests: data.requests.length, support: data.tickets.length }} />
            <p className="mt-3 text-[11.5px] leading-relaxed text-steel">
              Los números reflejan únicamente lo registrado en tu cuenta. Cuando un servicio se activa o un pedido se procesa,
              aparece aquí automáticamente.
            </p>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Notificaciones" description="Novedades de tu cuenta." padded={false}
            action={unread.length > 0 && <Button size="sm" variant="ghost" onClick={() => navigate("/account/notifications")}>{unread.length} sin leer</Button>}>
            {data.notifications.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {data.notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="flex gap-3 px-5 py-3.5">
                    <span className={n.read ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-steel/50" : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-volt"} aria-hidden />
                    <span className="min-w-0"><span className="block text-[13px] font-medium text-snow">{n.title}</span><span className="mt-0.5 block text-[11.5px] leading-relaxed text-steel">{n.description}</span></span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon={Bell} title="Sin notificaciones." description="Cuando algo cambie en tu cuenta, te avisaremos aquí." />}
            <div className="border-t border-white/[0.06] p-3"><Button size="sm" variant="ghost" className="w-full" onClick={() => navigate("/account/notifications")}>Ver todas</Button></div>
          </Panel>

          <Panel title="Tu cuenta">
            <dl className="space-y-3 text-sm">
              <div><dt className="text-[11px] uppercase tracking-[0.12em] text-steel/70">Nombre</dt><dd className="mt-0.5">{displayName(data.profile)}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[0.12em] text-steel/70">Correo</dt><dd className="mt-0.5 break-all text-steel">{data.profile.email || "Sin confirmar"}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[0.12em] text-steel/70">Tipo de cuenta</dt><dd className="mt-0.5">Individual</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" icon={User} onClick={() => navigate("/account/profile")}>Mi perfil</Button>
              <Button size="sm" variant="ghost" icon={ShieldCheck} onClick={() => navigate("/account/security")}>Seguridad</Button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ─────────── Mis servicios ─────────── */

export function ServicesPage() {
  const { navigate } = useAccount();
  return (
    <>
      <PageHeader eyebrow="Mi InfiniHon" title="Mis servicios" description="Gestiona y consulta tus servicios de InfiniHon."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Mis servicios" }]}
        actions={<Button variant="primary" icon={Send} onClick={() => navigate("/account/requests/new")}>Solicitar un servicio</Button>} />
      <Panel padded={false}>
        <EmptyState icon={Boxes} title="Aún no tienes servicios activos"
          description="Cuando contrates un servicio con InfiniHon aparecerá aquí, con su estado, fecha de inicio y próxima acción."
          action={<div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" icon={Compass} onClick={() => navigate("/account/favorites")}>Explorar servicios</Button>
            <Button icon={Send} onClick={() => navigate("/account/requests/new")}>Solicitar un servicio</Button>
          </div>} />
      </Panel>
      <div className="mt-4"><DemoNote>
        InfiniHon no simula servicios que no existen. Esta sección se llena desde el backend cuando un servicio se activa para tu cuenta.
      </DemoNote></div>
    </>
  );
}

export function ServiceDetailPage() {
  const { navigate } = useAccount();
  return (
    <>
      <PageHeader eyebrow="Servicio" title="Servicio no disponible"
        breadcrumbs={[{ label: "Mis servicios", to: "/account/services" }, { label: "Detalle" }]} />
      <Panel>
        <EmptyState icon={Boxes} title="Este servicio no está en tu cuenta."
          description="Solo puedes ver servicios contratados por ti. Si esperabas verlo aquí, contacta a soporte."
          action={<div className="flex gap-2"><Button variant="primary" icon={Headphones} onClick={() => navigate("/account/support")}>Contactar soporte</Button><Button onClick={() => navigate("/account/services")}>Volver</Button></div>} />
      </Panel>
    </>
  );
}

/* ─────────── Mis pedidos ─────────── */

export function OrdersPage() {
  const { data, navigate } = useAccount();
  const columns: Column<PortalOrder>[] = [
    { key: "id", header: "Pedido", render: (o) => (
      <div><div className="font-mono text-[11px] text-steel">{o.id}</div>
        <div className="mt-0.5 text-[12px] text-snow/80">{o.items.reduce((n, i) => n + i.qty, 0)} artículo(s)</div></div>
    ) },
    { key: "created", header: "Fecha", render: (o) => <span className="text-steel">{fmtDate(o.created)}</span> },
    { key: "status", header: "Estado", render: (o) => <StatusBadge status={o.status} /> },
  ];
  return (
    <>
      <PageHeader eyebrow="Mi InfiniHon" title="Mis pedidos" description="Consulta el estado de tus compras."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Mis pedidos" }]} />
      <Panel padded={false}>
        <ResourceTable caption="Mis pedidos" columns={columns} rows={data.orders} getKey={(o) => o.id}
          onRowClick={(o) => navigate(`/account/orders/${o.id}`)}
          empty={<EmptyState icon={Package} title="Sin pedidos todavía"
            description="Tus pedidos aparecerán aquí, con sus productos, totales y estado de entrega." />} />
      </Panel>
      <div className="mt-4 text-[11.5px] leading-relaxed text-steel">
        Los pedidos se sincronizan con tu cuenta. Cuando realices una compra, aparecerá aquí automáticamente.
      </div>
    </>
  );
}

export function OrderDetailPage({ id }: { id: string }) {
  const { data, navigate } = useAccount();
  const order = data.orders.find((o) => o.id === id);
  if (!order) {
    return (
      <>
        <PageHeader eyebrow="Pedido" title="Pedido no disponible" breadcrumbs={[{ label: "Mis pedidos", to: "/account/orders" }, { label: "Detalle" }]} />
        <Panel>
          <EmptyState icon={Package} title="Este pedido no está en tu cuenta."
            description="Solo puedes consultar tus propios pedidos."
            action={<div className="flex gap-2"><Button variant="primary" icon={Headphones} onClick={() => navigate("/account/support")}>Necesito ayuda</Button><Button onClick={() => navigate("/account/orders")}>Volver</Button></div>} />
        </Panel>
      </>
    );
  }
  const count = order.items.reduce((n, i) => n + i.qty, 0);
  return (
    <>
      <PageHeader eyebrow={`Pedido ${order.id}`} title={`Pedido ${order.id}`}
        breadcrumbs={[{ label: "Mis pedidos", to: "/account/orders" }, { label: order.id }]}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={order.status} /><span className="text-xs text-steel">Creado {fmtDate(order.created)}</span></span>}
        actions={<Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/account/orders")}>Volver</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Artículos" description={`${count} artículo(s) en este pedido.`} padded={false}>
            {order.items.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-snow">{i.productId}</span>
                    <span className="shrink-0 text-sm text-steel">× {i.qty}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="px-5 py-6 text-sm text-steel">Este pedido no tiene artículos registrados.</p>}
          </Panel>
          {order.notes && <Panel title="Notas"><p className="whitespace-pre-line text-sm leading-relaxed text-snow/90">{order.notes}</p></Panel>}
        </div>

        <div className="space-y-4">
          <Panel title="Detalles">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-steel">Pedido</dt><dd className="font-mono text-right">{order.id}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-steel">Estado</dt><dd><StatusBadge status={order.status} /></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-steel">Fecha</dt><dd className="text-right">{fmtDate(order.created)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-steel">Artículos</dt><dd className="text-right">{count}</dd></div>
            </dl>
          </Panel>
          <Panel title="¿Necesitas ayuda con este pedido?">
            <p className="text-[13px] leading-relaxed text-steel">Cuéntanos qué pasa y el equipo de soporte lo revisará.</p>
            <Button size="sm" className="mt-3 w-full" onClick={() => navigate("/account/support")}>Contactar soporte</Button>
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ─────────── Favoritos ─────────── */

export function FavoritesPage() {
  const { data, toggleFavorite, navigate, toast } = useAccount();
  const catalog = data.catalog;
  const saved = data.favorites.map((id) => catalog.find((s) => s.id === id)).filter(Boolean);
  return (
    <>
      <PageHeader eyebrow="Mi InfiniHon" title="Favoritos" description="Servicios y productos que guardaste para consultar después."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Favoritos" }]} />
      {saved.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {saved.map((s) => s && (
            <div key={s.id} className="flex flex-col rounded-2xl border border-white/[0.07] bg-ink/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="text-base font-bold text-snow">{s.name}</h3><p className="mt-0.5 text-[11.5px] uppercase tracking-[0.12em] text-steel">{s.category}</p></div>
                <button onClick={() => { toggleFavorite(s.id); toast("Eliminado de favoritos.", "info"); }} aria-label={`Quitar ${s.name} de favoritos`} className="text-steel hover:text-snow"><Heart className="h-4 w-4 fill-current text-volt" /></button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-steel">{s.description}</p>
              <div className="mt-auto flex gap-2 pt-4">
                <Button size="sm" variant="primary" onClick={() => navigate(`/account/requests/new?service=${s.id}`)}>Solicitar</Button>
                <Button size="sm" variant="ghost" onClick={() => toast(`Vista detallada de ${s.name} disponible en el sitio público.`, "info")}>Ver</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Panel>
          <EmptyState icon={Heart} title="Aún no has guardado nada"
            description="Guarda los servicios que te interesen para tenerlos a mano."
            action={<Button variant="primary" icon={Compass} onClick={() => navigate("/account/favorites")}>Explorar InfiniHon</Button>} />
        </Panel>
      )}

      <Panel className="mt-4" title="Explorar servicios de InfiniHon" description="Guarda los que te interesen." padded={false}>
        <ul className="divide-y divide-white/[0.05]">
          {catalog.map((s) => {
            const on = data.favorites.includes(s.id);
            return (
              <li key={s.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-snow">{s.name}</h3><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-steel">{s.category}</span></div>
                  <p className="mt-1 text-[13px] leading-relaxed text-steel">{s.description}</p>
                </div>
                <Button size="sm" variant={on ? "secondary" : "ghost"} onClick={() => { toggleFavorite(s.id); toast(on ? "Eliminado de favoritos." : "Guardado en favoritos."); }} aria-pressed={on}>
                  <Heart className={on ? "h-3.5 w-3.5 fill-current text-volt" : "h-3.5 w-3.5"} />{on ? "Guardado" : "Guardar"}
                </Button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

/* ─────────── Facturación / Organización / Documentos ─────────── */

export function BillingPage() {
  const { navigate } = useAccount();
  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Facturación" description="Información de facturación, métodos de pago, facturas y transacciones."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Facturación" }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Información de facturación" description="Datos fiscales usados en tus documentos.">
          <p className="text-sm text-steel">Aún no hay información de facturación guardada.</p>
          <Button size="sm" className="mt-4" icon={Settings2} onClick={() => navigate("/account/profile")}>Completar mis datos</Button>
        </Panel>
        <Panel title="Métodos de pago">
          <p className="text-sm text-steel">No hay métodos de pago registrados.</p>
          <DemoNote>Los pagos no están integrados. InfiniHon no simula un proceso de pago.</DemoNote>
        </Panel>
        <Panel title="Facturas" padded={false}><EmptyState icon={FileText} title="Sin facturas" description="Tus facturas aparecerán cuando tu cuenta tenga actividad de facturación." /></Panel>
        <Panel title="Transacciones" padded={false}><EmptyState icon={CreditCard} title="Sin transacciones" description="No hay movimientos registrados en tu cuenta." /></Panel>
      </div>
      <div className="mt-4"><DemoNote>Las funciones de facturación aparecerán aquí cuando tu cuenta tenga actividad de facturación.</DemoNote></div>
    </>
  );
}

export function OrganizationPage() {
  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Organización" description="Gestiona la organización a la que perteneces, sus miembros y servicios."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Organización" }]} />
      <Panel>
        <EmptyState icon={Users} title="No perteneces a una organización"
          description="Tu cuenta es individual. Si tu empresa tiene una cuenta empresarial de InfiniHon, pídele al administrador que te invite con tu correo."
          action={<Button variant="primary" icon={Headphones} onClick={() => window.location.assign("/account/support")}>Consultar a soporte</Button>} />
      </Panel>
      <div className="mt-4"><DemoNote>Esta sección solo se muestra a usuarios que pertenecen a una organización. Un usuario individual no debería verla.</DemoNote></div>
    </>
  );
}

export function DocumentsPage() {
  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Documentos" description="Cotizaciones, acuerdos, reportes y documentos de servicio asociados a tu cuenta."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Documentos" }]} />
      <Panel padded={false}>
        <EmptyState icon={FileText} title="Sin documentos"
          description="Aquí encontrarás las cotizaciones, acuerdos y reportes vinculados a tus servicios. InfiniHon no crea documentos de ejemplo." />
      </Panel>
    </>
  );
}

/* ─────────── Centro de ayuda ─────────── */

const helpTopics = [
  { q: "¿Cómo solicito un servicio?", a: "Ve a «Solicitar un servicio», describe lo que necesitas y el equipo te responderá con un alcance y una propuesta." },
  { q: "¿Cuánto tarda una respuesta de soporte?", a: "Los tickets se revisan en orden de llegada. No publicamos tiempos de respuesta que no podamos cumplir." },
  { q: "¿Puedo cambiar el alcance de un servicio?", a: "Sí. Abre el servicio y usa «Solicitar cambios», o crea una solicitud de tipo Cambio." },
  { q: "¿Cómo protejo mi cuenta?", a: "Activa la verificación en dos pasos en la sección Seguridad y revisa tus sesiones activas." },
  { q: "¿Dónde veo mis facturas?", a: "En Facturación. Solo aparecen cuando tu cuenta tiene actividad de facturación real." },
];

export function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  const { navigate } = useAccount();
  return (
    <>
      <PageHeader eyebrow="Soporte" title="Centro de ayuda" description="Respuestas rápidas sobre tu cuenta y tus servicios."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Centro de ayuda" }]}
        actions={<Button variant="primary" icon={Headphones} onClick={() => navigate("/account/support")}>Contactar soporte</Button>} />
      <Panel padded={false}>
        <ul className="divide-y divide-white/[0.05]">
          {helpTopics.map((t, i) => (
            <li key={t.q}>
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-semibold text-snow">{t.q}</span>
                <span className={`shrink-0 text-lg text-steel transition-transform ${open === i ? "rotate-45 text-volt" : ""}`} aria-hidden>+</span>
              </button>
              {open === i && <p className="px-5 pb-4 text-[13px] leading-relaxed text-steel">{t.a}</p>}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}


