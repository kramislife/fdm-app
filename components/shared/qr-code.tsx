"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaQrcode, FaSyncAlt } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { BsQrCode } from "react-icons/bs";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

interface MemberQRDialogProps {
  memberQr: string;
  userName: string;
  onRegenerate?: () => void;
  isPendingRegenerate?: boolean;
  triggerClassName?: string;
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function MemberQRDialog({
  memberQr,
  userName,
  onRegenerate,
  isPendingRegenerate,
  triggerClassName,
  defaultOpen,
  onClose,
}: MemberQRDialogProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) onClose?.();
  }

  useEffect(() => {
    if (memberQr) {
      QRCode.toDataURL(memberQr, {
        width: 512,
        margin: 2,
      })
        .then((url) => setDataUrl(url))
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

  const confirmRegenerate = () => {
    onRegenerate?.();
    setShowRegenerateConfirm(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!defaultOpen && (
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
            <h2 className="text-lg font-bold">Member QR Code</h2>
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
                  <BsQrCode className="w-52 h-52 text-muted-foreground/20" />
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
          {onRegenerate && (
            <>
              <button
                type="button"
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={isPendingRegenerate}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-150 disabled:opacity-50 cursor-pointer"
              >
                <FaSyncAlt
                  className={`text-xs ${isPendingRegenerate ? "animate-spin" : ""}`}
                />
                Regenerate
              </button>

              <DeleteConfirmDialog
                open={showRegenerateConfirm}
                onClose={() => setShowRegenerateConfirm(false)}
                onConfirm={confirmRegenerate}
                isDeleting={isPendingRegenerate}
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
