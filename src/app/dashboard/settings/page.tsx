"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Settings, Globe, Bell, User, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [language, setLanguage] = useState("es");
  const [notifications, setNotifications] = useState(true);

  const displayName = user?.fullName || user?.firstName || "Usuario";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza tu experiencia en Nitido
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Perfil */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
                <User className="h-4 w-4 text-brand-400" />
              </div>
              <p className="text-sm font-medium text-foreground">Perfil</p>
            </div>
            <Separator className="bg-border/50" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={displayName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20 text-sm font-semibold text-brand-300">
                    {displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferencias */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
                <Settings className="h-4 w-4 text-brand-400" />
              </div>
              <p className="text-sm font-medium text-foreground">Preferencias</p>
            </div>
            <Separator className="bg-border/50" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-foreground">Idioma</Label>
                  <p className="text-[11px] text-muted-foreground">Idioma de la interfaz</p>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32 h-8 text-xs bg-muted/40 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es" className="text-xs">Español</SelectItem>
                    <SelectItem value="en" className="text-xs">Inglés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-foreground">Tema oscuro</Label>
                  <p className="text-[11px] text-muted-foreground">Modo oscuro activado</p>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-foreground">Notificaciones</Label>
                  <p className="text-[11px] text-muted-foreground">Avisos de optimización completada</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
                <Globe className="h-4 w-4 text-brand-400" />
              </div>
              <p className="text-sm font-medium text-foreground">API y Datos</p>
            </div>
            <Separator className="bg-border/50" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-foreground">Motor IA</Label>
                  <p className="text-[11px] text-muted-foreground">Proveedor de inteligencia artificial</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-brand-500/10 text-brand-400 border-brand-500/20">
                  OpenAI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-foreground">Base de datos</Label>
                  <p className="text-[11px] text-muted-foreground">Almacenamiento de prompts</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">
                  Supabase
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-foreground">Autenticación</Label>
                  <p className="text-[11px] text-muted-foreground">Gestión de sesiones</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">
                  Clerk
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
                <Bell className="h-4 w-4 text-brand-400" />
              </div>
              <p className="text-sm font-medium text-foreground">Acerca de</p>
            </div>
            <Separator className="bg-border/50" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Versión</p>
                <p className="text-xs text-foreground font-medium">0.1.0</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Framework</p>
                <p className="text-xs text-foreground font-medium">Next.js 16</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Motor IA</p>
                <p className="text-xs text-foreground font-medium">OpenAI GPT-4o-mini</p>
              </div>
            </div>
            <Separator className="bg-border/50" />
            <Button
              variant="outline"
              className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BadgeMock({ active }: { active: boolean }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
        active
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-muted/40 text-muted-foreground border-border"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
