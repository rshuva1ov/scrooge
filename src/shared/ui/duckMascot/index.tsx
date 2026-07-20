export type TDuckPose = "rich" | "vault" | "sad" | "chart" | "wave" | "empty";

interface IDuckMascotProps {
  pose?: TDuckPose;
  size?: number;
  className?: string;
  alt?: string;
}

const BODY = "#f4c430";
const BILL = "#ff8c00";
const HAT = "#1a2744";
const HAT_BAND = "#c41e3a";
const SHIRT = "#114b5f";
const COIN = "#ffd700";

export const DuckMascot = ({ pose = "rich", size = 80, className, alt = "Scrooge duck" }: IDuckMascotProps) => (
  <svg
    aria-hidden={alt ? undefined : true}
    className={className}
    height={size}
    role="img"
    viewBox="0 0 120 120"
    width={size}
  >
    {alt ? <title>{alt}</title> : null}
    {pose === "rich" && <RichDuck bill={BILL} body={BODY} coin={COIN} hat={HAT} hatBand={HAT_BAND} shirt={SHIRT} />}
    {pose === "vault" && <VaultDuck bill={BILL} body={BODY} coin={COIN} hat={HAT} shirt={SHIRT} />}
    {pose === "sad" && <SadDuck bill={BILL} body={BODY} hat={HAT} shirt={SHIRT} />}
    {pose === "chart" && <ChartDuck bill={BILL} body={BODY} coin={COIN} hat={HAT} hatBand={HAT_BAND} shirt={SHIRT} />}
    {pose === "wave" && <WaveDuck bill={BILL} body={BODY} coin={COIN} hat={HAT} hatBand={HAT_BAND} shirt={SHIRT} />}
    {pose === "empty" && <EmptyDuck bill={BILL} body={BODY} hat={HAT} shirt={SHIRT} />}
  </svg>
);

interface IDuckParts {
  body: string;
  bill: string;
  hat: string;
  shirt: string;
  coin?: string;
  hatBand?: string;
}

const DuckHead = ({ body, bill }: Pick<IDuckParts, "body" | "bill">) => (
  <>
    <ellipse cx="58" cy="52" fill={body} rx="22" ry="20" />
    <ellipse cx="72" cy="50" fill={bill} rx="10" ry="7" />
    <circle cx="66" cy="44" fill="#1a1200" r="2.5" />
  </>
);

const TopHat = ({ hat, hatBand }: Pick<IDuckParts, "hat" | "hatBand">) => (
  <>
    <rect fill={hat} height="16" rx="2" width="34" x="41" y="18" />
    <rect fill={hat} height="3" rx="1" width="42" x="37" y="32" />
    {hatBand ? <rect fill={hatBand} height="3" width="34" x="41" y="28" /> : null}
  </>
);

const RichDuck = ({ body, bill, hat, hatBand, shirt, coin }: IDuckParts) => (
  <>
    <TopHat hat={hat} hatBand={hatBand} />
    <DuckHead bill={bill} body={body} />
    <path d="M44 68 Q58 82 72 68 L72 92 Q58 98 44 92 Z" fill={shirt} />
    <circle cx="88" cy="72" fill={coin ?? "#ffd700"} r="10" />
    <text fill="#1a1200" fontSize="10" fontWeight="700" textAnchor="middle" x="88" y="76">
      ₽
    </text>
  </>
);

const VaultDuck = ({ body, bill, hat, shirt, coin }: IDuckParts) => (
  <>
    <ellipse cx="60" cy="98" fill={coin ?? "#ffd700"} opacity="0.35" rx="46" ry="10" />
    {[20, 35, 50, 65, 80, 95].map((x) => (
      <circle key={x} cx={x} cy={92} fill={coin ?? "#ffd700"} r="5" />
    ))}
    <TopHat hat={hat} />
    <DuckHead bill={bill} body={body} />
    <path d="M42 66 Q58 78 74 66 L76 88 Q58 96 40 88 Z" fill={shirt} />
    <ellipse cx="58" cy="74" fill={coin ?? "#ffd700"} rx="8" ry="4" />
  </>
);

const SadDuck = ({ body, bill, hat, shirt }: IDuckParts) => (
  <>
    <TopHat hat={hat} />
    <ellipse cx="58" cy="54" fill={body} rx="22" ry="20" />
    <ellipse cx="72" cy="54" fill={bill} rx="10" ry="7" />
    <path d="M62 42 Q66 46 70 42" fill="none" stroke="#1a1200" strokeWidth="2" />
    <path d="M48 48 Q52 44 56 48" fill="none" stroke="#1a1200" strokeWidth="2" />
    <path d="M44 70 Q58 84 72 70 L72 94 Q58 100 44 94 Z" fill={shirt} />
    <text fill="#c41e3a" fontSize="18" fontWeight="700" textAnchor="middle" x="92" y="78">
      −
    </text>
  </>
);

const ChartDuck = ({ body, bill, hat, hatBand, shirt, coin }: IDuckParts) => (
  <>
    <rect fill="#0d2137" height="34" rx="4" width="40" x="68" y="58" />
    <rect fill={coin ?? "#ffd700"} height="10" width="6" x="74" y="76" />
    <rect fill="#c41e3a" height="16" width="6" x="84" y="70" />
    <rect fill="#7cfc00" height="22" width="6" x="94" y="64" />
    <TopHat hat={hat} hatBand={hatBand} />
    <DuckHead bill={bill} body={body} />
    <path d="M38 68 Q54 80 70 68 L70 92 Q54 98 38 92 Z" fill={shirt} />
    <circle cx="48" cy="46" fill="none" r="6" stroke="#1a2744" strokeWidth="1.5" />
    <line stroke="#1a2744" strokeWidth="1.5" x1="54" x2="58" y1="46" y2="50" />
  </>
);

const WaveDuck = ({ body, bill, hat, hatBand, shirt, coin }: IDuckParts) => (
  <>
    <TopHat hat={hat} hatBand={hatBand} />
    <DuckHead bill={bill} body={body} />
    <path d="M44 68 Q58 82 72 68 L72 92 Q58 98 44 92 Z" fill={shirt} />
    <ellipse cx="34" cy="72" fill={body} rx="8" ry="6" transform="rotate(-20 34 72)" />
    <circle cx="86" cy="66" fill={coin ?? "#ffd700"} r="8" />
  </>
);

const EmptyDuck = ({ body, bill, hat, shirt }: IDuckParts) => (
  <>
    <TopHat hat={hat} />
    <ellipse cx="58" cy="54" fill={body} rx="22" ry="20" />
    <ellipse cx="72" cy="52" fill={bill} rx="10" ry="7" />
    <circle cx="66" cy="44" fill="#1a1200" r="2.5" />
    <path d="M44 70 Q58 84 72 70 L72 94 Q58 100 44 94 Z" fill={shirt} />
    <rect fill="#1a2744" height="16" rx="3" stroke="#ffd700" strokeWidth="1.5" width="22" x="78" y="68" />
    <text fill="#ffd700" fontSize="14" textAnchor="middle" x="89" y="80">
      ?
    </text>
  </>
);
