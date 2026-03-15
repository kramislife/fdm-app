import { Loading } from "@/components/ui/loading";

export default function RootLoading({ text }: { text?: string }) {
  return <Loading fullScreen text={text ?? "Loading..."} />;
}
