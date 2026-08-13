// Backwards-compatible aliases over the ETHERUM logo system.
import { EtherumAppIcon, EtherumLogo } from "./EtherumLogo";

export { EtherumLogo, EtherumSymbol, EtherumAppIcon } from "./EtherumLogo";

export function Logo({ size = 40 }: { size?: number }) {
  return <EtherumAppIcon size={size} />;
}

export function Brand({ size = 40 }: { size?: number }) {
  return <EtherumLogo size={size} />;
}
