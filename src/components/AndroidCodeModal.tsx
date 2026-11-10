import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidProjectFile } from '../data/androidProjectSource';
import { ThemeColors } from '../types/music';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Smartphone,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Cpu,
  Cloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
  deferredPrompt?: any;
  onInstallApp?: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({
  isOpen,
  onClose,
  theme,
  deferredPrompt,
  onInstallApp,
}) => {
  const [activeTab, setActiveTab] = useState<'ready' | 'files'>('ready');
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add each project file with proper directory structure
      ANDROID_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Embed official VyBORA logo PNG binary into Android resources
      try {
        const logoRes = await fetch('/logo_vybora.png');
        if (logoRes.ok) {
          const logoBuffer = await logoRes.arrayBuffer();
          zip.file('app/src/main/res/drawable/logo_vybora.png', logoBuffer);
          zip.file('app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', logoBuffer);
          zip.file('app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', logoBuffer);
          zip.file('app/src/main/res/drawable-xxxhdpi/ic_launcher_foreground.png', logoBuffer);
        }
      } catch (imgErr) {
        console.warn('Could not bundle binary logo into zip:', imgErr);
      }

      // Add Gradle Wrapper executable scripts
      zip.file(
        'gradlew',
        `#!/bin/sh
##############################################################################
##
##  Gradle start up script for UN*X
##
##############################################################################
APP_BASE_NAME=\`basename "$0"\`
APP_HOME="\`dirname "$0"\`"
exec gradle "$@"
`
      );

      zip.file(
        'gradlew.bat',
        `@rem#########################################################################
@rem
@rem  Gradle start up script for Windows
@rem
#########################################################################
@echo off
gradle %*
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vybora-android-studio-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black p-0.5 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0">
              <img
                src="/logo_vybora.png"
                alt="VyBORA Logo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  VyBORA — APK Móvil & Proyecto Android
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  APK Lista
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instalación directa en teléfono, compilación automática en la nube y proyecto nativo Kotlin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg"
              style={{ backgroundColor: theme.primary }}
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Comprimiendo...' : 'Descargar ZIP'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation: "APK Lista" vs "Explorador de Archivos" */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-black/40">
          <button
            onClick={() => setActiveTab('ready')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'ready'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>⚡ Tu APK Lista (Instalar en Teléfono)</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'files'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>📂 Archivos Android Studio ({ANDROID_PROJECT_FILES.length})</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'ready' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-[#050508] to-black">
            {/* Hero Status Banner */}
            <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-purple-950/40 via-slate-900/50 to-cyan-950/40 border border-purple-500/30 overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Paquete VyBORA v1.0 listo y verificado
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Tu aplicación VyBORA está lista para instalar
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Todo el código fuente nativo en Kotlin, ExoPlayer 1.3.1, detector de canciones MediaStore, ecualizador de 5 bandas, logo oficial en alta resolución y el flujo de compilación automática en la nube están preparados.
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, #06b6d4)`,
                      boxShadow: `0 0 25px ${theme.primaryGlow}`,
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span>{isZipping ? 'Preparando ZIP...' : 'Descargar ZIP Completo'}</span>
                  </button>

                  {deferredPrompt && (
                    <button
                      onClick={onInstallApp}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 transition-all"
                    >
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span>Instalar WebAPK en este teléfono</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3 Clear Methods to Install or Compile the APK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Method 1: Instant 1-Touch Install on Android */}
              <div className="rounded-2xl p-4 sm:p-5 bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold">
                      MÉTODO 1 · INMEDIATO
                    </span>
                    <Smartphone className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">
                    Instalar en Teléfono (WebAPK)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Instala VyBORA directamente en tu móvil Android en 10 segundos con icono oficial, pantalla completa y reproducción en segundo plano.
                  </p>
                  <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Abre el enlace de la app en Chrome o Samsung Internet desde tu teléfono.</li>
                    <li>Toca los tres puntos (⋮) o la barra superior del navegador.</li>
                    <li>Selecciona <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Añadir a pantalla de inicio"</strong>.</li>
                    <li>Android instalará el APK en tu pantalla principal.</li>
                  </ol>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Sin necesidad de computadora</span>
                </div>
              </div>

              {/* Method 2: Cloud GitHub Actions Build (Zero PC) */}
              <div className="rounded-2xl p-4 sm:p-5 bg-white/[0.02] border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex flex-col justify-between relative">
                <div className="absolute top-2 right-2 text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  Recomendado para APK Nativo
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold">
                      MÉTODO 2 · NUBE
                    </span>
                    <Cloud className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">
                    Compilar APK desde el Móvil
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Compila un archivo <code className="text-cyan-300 font-mono">.apk</code> nativo directamente desde el teléfono sin instalar Java ni Android Studio.
                  </p>
                  <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Descarga el ZIP con el botón de arriba.</li>
                    <li>Entra a <strong className="text-white">github.com</strong> en tu navegador móvil y crea un repositorio.</li>
                    <li>Sube los archivos del ZIP a tu repositorio.</li>
                    <li>GitHub detectará <code className="text-cyan-300 text-[10px]">.github/workflows/android-build.yml</code> y compilará el APK en la nube.</li>
                    <li>En la pestaña <strong className="text-white">Actions</strong> descarga el archivo <strong className="text-white">VyBORA-v1.0-APK-Debug.apk</strong> e instálalo.</li>
                  </ol>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-cyan-400 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Workflow de compilación incluido en el ZIP</span>
                </div>
              </div>

              {/* Method 3: Android Studio Desktop Build */}
              <div className="rounded-2xl p-4 sm:p-5 bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold">
                      MÉTODO 3 · PC / MAC
                    </span>
                    <Cpu className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">
                    Android Studio (PC)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Para desarrolladores que deseen compilar y depurar en Android Studio con Gradle y emulador o cable USB.
                  </p>
                  <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Descarga y descomprime el ZIP en tu PC.</li>
                    <li>Abre Android Studio y selecciona <strong className="text-white">"Open"</strong> en la carpeta extraída.</li>
                    <li>Espera a que Gradle sincronice (Gradle 8.7 y Kotlin 1.9 ya vienen configurados).</li>
                    <li>Conecta tu teléfono Android o emulador y haz clic en <strong className="text-white">Run ▶️</strong> o ejecuta en terminal: <code className="text-purple-300 text-[10px]">./gradlew assembleDebug</code>.</li>
                  </ol>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-purple-300 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Compatible con Android 8.0 hasta Android 15</span>
                </div>
              </div>
            </div>

            {/* Included in this APK summary */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>¿Qué incluye este paquete APK de VyBORA?</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-white/5">
                  <span className="text-purple-400 font-bold block mb-1">ExoPlayer 1.3.1</span>
                  <span className="text-slate-400 text-[11px]">MediaSession para control de audio y bloqueo de pantalla</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/5">
                  <span className="text-cyan-400 font-bold block mb-1">Android MediaStore</span>
                  <span className="text-slate-400 text-[11px]">Escaneo automático de archivos MP3, WAV, FLAC internos</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/5">
                  <span className="text-fuchsia-400 font-bold block mb-1">Ecualizador 5 Bandas</span>
                  <span className="text-slate-400 text-[11px]">Efectos nativos Bass Boost y Virtualizador 3D</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/5">
                  <span className="text-emerald-400 font-bold block mb-1">Logo VyBORA Oficial</span>
                  <span className="text-slate-400 text-[11px]">Iconos adaptativos para Google Play y APK</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* File Explorer + Code Editor View */
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* File Explorer Sidebar */}
            <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-white/10 bg-black/40 p-3 overflow-y-auto shrink-0 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
                Estructura de Archivos
              </p>
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 truncate ${
                      isSelected
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <FileCode className="w-4 h-4 shrink-0 text-purple-400" />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col bg-[#050508] overflow-hidden">
              {/* File info banner */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5 text-xs">
                <div className="min-w-0 pr-2">
                  <span className="font-mono text-purple-300 font-semibold">{selectedFile.path}</span>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{selectedFile.description}</p>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code lines */}
              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed selection:bg-purple-500/30">
                <pre className="whitespace-pre">{selectedFile.content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer info banner */}
        <div className="p-3 border-t border-white/10 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-5 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Permisos Android 13+ (READ_MEDIA_AUDIO, FOREGROUND_SERVICE) y ExoPlayer 1.3.1 verificados.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">VyBORA v1.0 · Creado por Kenier Bravo</span>
            <button
              onClick={handleDownloadZip}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
