import React, { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/ui/utils";

declare global {
  interface Window {
    cloudinary?: any;
    ENV?: {
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_UPLOAD_PRESET: string;
    };
  }
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  uploadInfo?: {
    secure_url: string;
    public_id: string;
    [key: string]: any;
  };
}

interface CloudinaryUploadProps {
  onUploadSuccess: (results: CloudinaryUploadResult[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  partnerSlug?: string;
}

export function CloudinaryUpload({
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  allowedTypes = [
    "image",
    "video",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ],
  className,
  children,
  disabled = false,
  partnerSlug,
}: CloudinaryUploadProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetRef = useRef<any>(null);

  // Load Cloudinary script
  useEffect(() => {
    if (window.cloudinary) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Cloudinary widget");
      onUploadError?.("Falha ao carregar widget de upload");
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onUploadError]);

  // Initialize widget when script loads
  useEffect(() => {
    if (!scriptLoaded || !window.cloudinary || !window.ENV) return;

    try {
      // Get CSS custom properties for theme consistency
      const getCSS = (property: string) => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(property)
          .trim();
      };

      // Convert HSL to hex
      const hslToHex = (hsl: string) => {
        const [h, s, l] = hsl.split(" ").map((val, i) => {
          if (i === 0) return parseInt(val);
          return parseInt(val.replace("%", ""));
        });

        const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l / 100 - c / 2;

        let r = 0,
          g = 0,
          b = 0;

        if (0 <= h && h < 60) {
          r = c;
          g = x;
          b = 0;
        } else if (60 <= h && h < 120) {
          r = x;
          g = c;
          b = 0;
        } else if (120 <= h && h < 180) {
          r = 0;
          g = c;
          b = x;
        } else if (180 <= h && h < 240) {
          r = 0;
          g = x;
          b = c;
        } else if (240 <= h && h < 300) {
          r = x;
          g = 0;
          b = c;
        } else if (300 <= h && h < 360) {
          r = c;
          g = 0;
          b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      };

      // Get theme colors
      const background = hslToHex(getCSS("--background"));
      const foreground = hslToHex(getCSS("--foreground"));
      const muted = hslToHex(getCSS("--muted"));
      const mutedForeground = hslToHex(getCSS("--muted-foreground"));
      const primary = hslToHex(getCSS("--primary"));
      const border = hslToHex(getCSS("--border"));
      const destructive = hslToHex(getCSS("--destructive"));

      // Configuração de pasta
      const folderPath = partnerSlug
        ? `${partnerSlug}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`
        : `bussola/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}`;

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: window.ENV.CLOUDINARY_CLOUD_NAME,
          uploadPreset: window.ENV.CLOUDINARY_UPLOAD_PRESET,
          multiple: maxFiles > 1,
          maxFiles,
          resourceType: "auto",
          clientAllowedFormats: allowedTypes,
          maxFileSize: 100000000, // 100MB
          // Configuração de pasta
          folder: folderPath,
          sources: ["local"], // Apenas arquivos locais
          showAdvancedOptions: false,
          cropping: false,
          showSkipCropButton: true,
          showUploadMoreButton: false,
          language: "pt",
          text: {
            browse: "Procurar",
            drag_and_drop: "Arraste e solte arquivos aqui",
            "local.browse": "Procurar",
            "local.dd_title_single": "Arraste e solte um arquivo aqui",
            "local.dd_title_multi": "Arraste e solte arquivos aqui",
            "local.drop_title_single": "Solte o arquivo para fazer upload",
            "local.drop_title_multi": "Solte os arquivos para fazer upload",
            "menu.browse": "Procurar",
            "notifications.upload_error": "Erro no upload",
            "notifications.upload_success": "Upload realizado com sucesso",
            "queue.done": "Concluído",
            "queue.upload_error": "Erro no upload",
            "queue.uploading": "Enviando...",
            or: "ou",
            close: "Fechar",
            back: "Voltar",
            advanced: "Avançado",
            done: "Concluído",
          },
          styles: {
            palette: {
              window: background,
              windowBorder: border,
              tabIcon: mutedForeground,
              menuIcons: mutedForeground,
              textDark: foreground,
              textLight: background,
              link: primary,
              action: primary,
              inactiveTabIcon: muted,
              error: destructive,
              inProgress: primary,
              complete: "#10B981", // Verde mantido
              sourceBg: muted,
            },
          },
        },
        (error: any, result: any) => {
          console.log("Cloudinary callback:", result?.event);

          if (error) {
            console.error("Cloudinary upload error:", error);
            onUploadError?.(error.message || "Erro no upload");
            return;
          }

          if (result && result.event === "queues-end") {
            console.log("Chamando onUploadSuccess");
            const uploadedFiles = result.info?.files || [result.info];
            onUploadSuccess(uploadedFiles);
          }
        },
      );
    } catch (error) {
      console.error("Error initializing Cloudinary widget:", error);
      onUploadError?.("Erro ao inicializar widget");
    }
  }, [scriptLoaded, maxFiles, allowedTypes, onUploadSuccess, onUploadError]);

  const handleUpload = () => {
    if (!widgetRef.current || disabled) return;
    widgetRef.current.open();
  };

  return !scriptLoaded ? (
    <div className="bg-secondary grid place-content-center rounded-l px-4">
      <div className="size-4 animate-spin rounded-full border-3 border-t-transparent"></div>
    </div>
  ) : (
    React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleUpload,
    })
  );
}

// Helper function to get optimized URLs
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    format?: string;
    quality?: string | number;
    crop?: string;
  } = {},
) {
  if (!window.ENV?.CLOUDINARY_CLOUD_NAME) return publicId;

  const baseUrl = `https://res.cloudinary.com/${window.ENV.CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transformations = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.crop) transformations.push(`c_${options.crop}`);

  const transformString =
    transformations.length > 0 ? `/${transformations.join(",")}` : "";

  return `${baseUrl}${transformString}/${publicId}`;
}
