"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaSyncAlt } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { BsQrCode } from "react-icons/bs";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { regenerateMyQR, type QRActionResult } from "./qr-code.actions";

interface UserQRDialogProps {
  memberQr: string;
  userName: string;
  regenerateAction?: () => Promise<QRActionResult>;
  showRegenerate?: boolean;
  triggerClassName?: string;
  defaultOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserQRDialog({
  memberQr,
  userName,
  regenerateAction,
  showRegenerate = true,
  triggerClassName,
  defaultOpen,
  onClose,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UserQRDialogProps) {
  const router = useRouter();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const open = isControlled ? controlledOpen : internalOpen;
  const [dataUrl, setDataUrl] = useState<string>("");
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  // Holds the toast to fire once the new QR image is rendered
  const pendingToast = useRef<{ title: string; description?: string } | null>(null);

  const resolvedAction = regenerateAction ?? regenerateMyQR;

  function handleOpenChange(val: boolean) {
    if (!isControlled) setInternalOpen(val);
    controlledOnOpenChange?.(val);
    if (!val) onClose?.();
  }

  useEffect(() => {
    if (memberQr) {
      QRCode.toDataURL(memberQr, { width: 512, margin: 2 })
        .then((url) => {
          setDataUrl(url);
          // Fire the deferred success toast only after the new QR is rendered
          if (pendingToast.current) {
            toast.success(pendingToast.current.title, {
              description: pendingToast.current.description,
            });
            pendingToast.current = null;
            setIsPending(false);
          }
        })
        .catch((err) => console.error("Failed to generate QR code:", err));
    }
  }, [memberQr]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `FRIENDS_${userName.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function confirmRegenerate() {
    setShowRegenerateConfirm(false);
    setDataUrl("");
    setIsPending(true);
    try {
      const result = await resolvedAction();
      if (result.success) {
        // Store the toast — it fires inside the useEffect once the new QR renders
        pendingToast.current = {
          title: result.title ?? "Success",
          description: result.description,
        };
        router.refresh();
      } else {
        toast.error(result.title ?? "Error", {
          description: result.description,
        });
        // Restore the existing QR image — memberQr didn't change so useEffect won't re-run
        QRCode.toDataURL(memberQr, { width: 512, margin: 2 })
          .then(setDataUrl)
          .catch((err) => console.error("Failed to restore QR code:", err));
        setIsPending(false);
      }
    } catch {
      toast.error("Error", { description: "Something went wrong." });
      QRCode.toDataURL(memberQr, { width: 512, margin: 2 })
        .then(setDataUrl)
        .catch((err) => console.error("Failed to restore QR code:", err));
      setIsPending(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!isControlled && !defaultOpen && (
          <DialogTrigger asChild>
            <Button variant="link" className={`h-auto p-0 ${triggerClassName}`}>
              View QR Code
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-sm overflow-hidden flex flex-col items-center text-center gap-3">
          <DialogTitle className="sr-only">
            {`QR Code for ${userName}`}
          </DialogTitle>

          {/* Title block */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Attendance Code</h2>
            <p className="text-xs text-muted-foreground">
              Open and show this at session check-in
            </p>
          </div>

          {/* QR with identity block */}
          <div className="flex flex-col items-center">
            <div className="relative w-52 h-52">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt={`QR Code for ${userName}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full animate-pulse flex items-center justify-center">
                  <BsQrCode className="w-48 h-48 text-muted-foreground/20" />
                </div>
              )}
            </div>
            <div className="mt-1 text-center space-y-1">
              <p className="text-sm font-extrabold uppercase">{userName}</p>
              <p className="text-xs text-muted-foreground">
                Friends of the Divine Mercy
              </p>
            </div>
          </div>

          {/* Download button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleDownload}
            disabled={!dataUrl}
          >
            <MdFileDownload />
            Download QR Code
          </Button>

          {/* Regenerate link */}
          {showRegenerate && (
            <>
              <button
                type="button"
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={isPending}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-150 disabled:opacity-50 cursor-pointer"
              >
                <FaSyncAlt
                  className={`text-xs ${isPending ? "animate-spin" : ""}`}
                />
                Regenerate
              </button>

              <DeleteConfirmDialog
                open={showRegenerateConfirm}
                onClose={() => setShowRegenerateConfirm(false)}
                onConfirm={confirmRegenerate}
                isDeleting={isPending}
                title="Regenerate QR Code?"
                description="Are you sure you want to regenerate this QR code? The current code will no longer work."
                confirmingText="Regenerating..."
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
