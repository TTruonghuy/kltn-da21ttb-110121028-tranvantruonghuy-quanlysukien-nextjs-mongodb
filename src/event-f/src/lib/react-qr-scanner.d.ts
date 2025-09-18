declare module "react-qr-scanner" {
  import * as React from "react";

  export interface QrReaderProps {
    delay?: number | false;
    onError?: (error: any) => void;
    onScan?: (data: string | null) => void;
    style?: React.CSSProperties;
    facingMode?: "user" | "environment";
    legacyMode?: boolean;
    className?: string;
    constraints?: MediaTrackConstraints;
  }

  export default class QrReader extends React.Component<QrReaderProps> {}
}
