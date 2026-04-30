// components/nameplates/index.tsx
import React from 'react';
import Svg, {
    Circle,
    Defs,
    Ellipse,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    Stop,
    Text as SvgText
} from 'react-native-svg';

export type NameplateSize = 'small' | 'large';

interface NameplateProps {
    username: string;
    size?: NameplateSize;
}

const DIMS = {
    small: { w: 180, h: 36, fontSize: 22, rx: 6 },
    large: { w: 280, h: 56, fontSize: 32, rx: 10 },
};

// ─── 1. MOR SARMAŞIKLI ───────────────────────────────────────────
export const NameplateThornsViolet: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 80">
            <Defs>
                {/* Ana panel gradient - ortada açık, kenarlarda koyu */}
                <LinearGradient id="nvGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#4A1572" />
                    <Stop offset="0.3" stopColor="#9B59C4" />
                    <Stop offset="0.5" stopColor="#C8A0E8" />
                    <Stop offset="0.7" stopColor="#9B59C4" />
                    <Stop offset="1" stopColor="#4A1572" />
                </LinearGradient>

                {/* Üst parlaklık */}
                <LinearGradient id="nvShine" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.25" />
                    <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <Stop offset="1" stopColor="#000000" stopOpacity="0.2" />
                </LinearGradient>

                {/* Metal köşe gradient */}
                <LinearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#2D0A4E" />
                    <Stop offset="0.5" stopColor="#1A0630" />
                    <Stop offset="1" stopColor="#0D0318" />
                </LinearGradient>

                {/* Kenar parlak çizgi */}
                <LinearGradient id="edgeGlow" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#6B21A8" stopOpacity="0" />
                    <Stop offset="0.3" stopColor="#A855F7" stopOpacity="1" />
                    <Stop offset="0.7" stopColor="#A855F7" stopOpacity="1" />
                    <Stop offset="1" stopColor="#6B21A8" stopOpacity="0" />
                </LinearGradient>
            </Defs>

            {/* ── ARKA GÖLGE ── */}
            <Rect x="14" y="14" width="312" height="54" rx="8"
                fill="#000000" opacity="0.4" />

            {/* ── ANA PANEL ── */}
            <Rect x="10" y="10" width="320" height="54" rx="8"
                fill="url(#nvGrad)" />

            {/* Parlaklık katmanı */}
            <Rect x="10" y="10" width="320" height="54" rx="8"
                fill="url(#nvShine)" />

            {/* ── ÜST KENAR parlak çizgi ── */}
            <Path d="M20,10 L320,10" stroke="url(#edgeGlow)" strokeWidth="1.5" />

            {/* ── ALT KENAR ince çizgi ── */}
            <Path d="M20,64 L320,64" stroke="#6B21A8" strokeWidth="1" opacity="0.6" />

            {/* ══ SOL METAL KÖŞE ÇERÇEVE ══ */}
            {/* Sol üst L köşe */}
            <Path d="M10,24 L10,10 L28,10" fill="none" stroke="#1A0630" strokeWidth="6" strokeLinecap="square" />
            <Path d="M10,24 L10,10 L28,10" fill="none" stroke="#5B2183" strokeWidth="1.5" strokeLinecap="square" />

            {/* Sol alt L köşe */}
            <Path d="M10,50 L10,64 L28,64" fill="none" stroke="#1A0630" strokeWidth="6" strokeLinecap="square" />
            <Path d="M10,50 L10,64 L28,64" fill="none" stroke="#5B2183" strokeWidth="1.5" strokeLinecap="square" />

            {/* ══ SAĞ METAL KÖŞE ÇERÇEVE ══ */}
            <Path d="M330,24 L330,10 L312,10" fill="none" stroke="#1A0630" strokeWidth="6" strokeLinecap="square" />
            <Path d="M330,24 L330,10 L312,10" fill="none" stroke="#5B2183" strokeWidth="1.5" strokeLinecap="square" />

            <Path d="M330,50 L330,64 L312,64" fill="none" stroke="#1A0630" strokeWidth="6" strokeLinecap="square" />
            <Path d="M330,50 L330,64 L312,64" fill="none" stroke="#5B2183" strokeWidth="1.5" strokeLinecap="square" />

            {/* ══ KÖŞE SİVRİLERİ (fotoğraftaki çıkıntılar) ══ */}
            {/* Sol üst sivri */}
            <Path d="M10,10 L2,2 L14,8 L10,16 Z" fill="url(#metalGrad)" stroke="#3D1265" strokeWidth="0.5" />
            {/* Sağ üst sivri */}
            <Path d="M330,10 L338,2 L326,8 L330,16 Z" fill="url(#metalGrad)" stroke="#3D1265" strokeWidth="0.5" />
            {/* Sol alt sivri */}
            <Path d="M10,64 L2,72 L14,66 L10,58 Z" fill="url(#metalGrad)" stroke="#3D1265" strokeWidth="0.5" />
            {/* Sağ alt sivri */}
            <Path d="M330,64 L338,72 L326,66 L330,58 Z" fill="url(#metalGrad)" stroke="#3D1265" strokeWidth="0.5" />

            {/* ══ SOL SARMAŞIK / DAL ══ */}
            {/* Ana dal */}
            <Path d="M12,18 C16,26 10,34 14,42 C18,50 12,56 16,62"
                stroke="#1A0630" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M12,18 C16,26 10,34 14,42 C18,50 12,56 16,62"
                stroke="#4A1878" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Sol üst dal yaprak */}
            <Path d="M14,24 C8,20 6,14 10,12 C14,10 16,16 14,24 Z"
                fill="#1A0630" stroke="#3D1265" strokeWidth="0.5" />
            {/* Küçük yaprak ucu */}
            <Path d="M10,12 L8,8" stroke="#2D0A4E" strokeWidth="1" strokeLinecap="round" />

            {/* Sol orta dal */}
            <Path d="M12,34 C6,32 4,28 8,26"
                stroke="#1A0630" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Path d="M12,34 C6,32 4,28 8,26"
                stroke="#4A1878" strokeWidth="1" fill="none" strokeLinecap="round" />
            {/* Yaprak */}
            <Path d="M8,26 C4,22 3,18 6,16 C9,14 11,20 8,26 Z"
                fill="#1A0630" stroke="#3D1265" strokeWidth="0.5" />

            {/* Sol alt dal */}
            <Path d="M14,48 C8,46 6,52 10,54"
                stroke="#1A0630" strokeWidth="2" fill="none" strokeLinecap="round" />
            <Path d="M10,54 L6,58" stroke="#2D0A4E" strokeWidth="1.5" strokeLinecap="round" />

            {/* ══ SAĞ SARMAŞIK / DAL ══ */}
            <Path d="M328,18 C324,26 330,34 326,42 C322,50 328,56 324,62"
                stroke="#1A0630" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M328,18 C324,26 330,34 326,42 C322,50 328,56 324,62"
                stroke="#4A1878" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Sağ üst yaprak */}
            <Path d="M326,24 C332,20 334,14 330,12 C326,10 324,16 326,24 Z"
                fill="#1A0630" stroke="#3D1265" strokeWidth="0.5" />
            <Path d="M330,12 L332,8" stroke="#2D0A4E" strokeWidth="1" strokeLinecap="round" />

            {/* Sağ orta dal */}
            <Path d="M328,34 C334,32 336,28 332,26"
                stroke="#1A0630" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Path d="M328,34 C334,32 336,28 332,26"
                stroke="#4A1878" strokeWidth="1" fill="none" strokeLinecap="round" />
            <Path d="M332,26 C336,22 337,18 334,16 C331,14 329,20 332,26 Z"
                fill="#1A0630" stroke="#3D1265" strokeWidth="0.5" />

            {/* Sağ alt dal */}
            <Path d="M326,48 C332,46 334,52 330,54"
                stroke="#1A0630" strokeWidth="2" fill="none" strokeLinecap="round" />
            <Path d="M330,54 L334,58" stroke="#2D0A4E" strokeWidth="1.5" strokeLinecap="round" />

            {/* ══ ALT DEKORATIF ELEMENTLER ══ */}
            {/* Sol yatay çizgi + elmas */}
            <Path d="M32,68 L118,68" stroke="#7C3AED" strokeWidth="1" opacity="0.7" />
            <Path d="M30,68 L36,64 L42,68 L36,72 Z" fill="none" stroke="#7C3AED" strokeWidth="1" />
            {/* Ok ucu */}
            <Path d="M118,68 L124,68" stroke="#7C3AED" strokeWidth="1" opacity="0.4" />
            <Path d="M124,66 L128,68 L124,70" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.6" />

            {/* Sağ yatay çizgi + elmas */}
            <Path d="M222,68 L308,68" stroke="#7C3AED" strokeWidth="1" opacity="0.7" />
            <Path d="M310,68 L304,64 L298,68 L304,72 Z" fill="none" stroke="#7C3AED" strokeWidth="1" />
            <Path d="M222,68 L216,68" stroke="#7C3AED" strokeWidth="1" opacity="0.4" />
            <Path d="M216,70 L212,68 L216,66" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.6" />

            {/* Orta elmas süs */}
            <Path d="M162,66 L170,60 L178,66 L170,72 Z"
                fill="#5B21B6" stroke="#A855F7" strokeWidth="1" />
            <Path d="M165,66 L170,62 L175,66 L170,70 Z"
                fill="#7C3AED" stroke="#C084FC" strokeWidth="0.5" />
            {/* Elmas parlaklık */}
            <Path d="M167,63 L170,61 L172,64" stroke="#DDD6FE" strokeWidth="0.5" fill="none" opacity="0.6" />

            {/* Küçük mor elmas - sol */}
            <Circle cx="50" cy="12" r="2.5" fill="#5B21B6" stroke="#A855F7" strokeWidth="0.5" />
            {/* Küçük mor elmas - sağ */}
            <Circle cx="290" cy="12" r="2.5" fill="#5B21B6" stroke="#A855F7" strokeWidth="0.5" />

            {/* ══ İSİM ══ */}
            <SvgText
                x="170"
                y={37 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#F3E8FF"
                fontFamily="System"
                letterSpacing="1"
            >
                {username}
            </SvgText>

            {/* İsim üst ince gölge efekti */}
            <SvgText
                x="170"
                y={36 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#9333EA"
                fontFamily="System"
                letterSpacing="1"
                opacity="0.3"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── 2. ALTIN KANATLI ────────────────────────────────────────────
export const NameplateGoldenWing: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { w, h, fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 72">
            <Defs>
                <LinearGradient id="gwGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#374151" />
                    <Stop offset="0.5" stopColor="#6B7280" />
                    <Stop offset="1" stopColor="#1F2937" />
                </LinearGradient>
                <LinearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#FDE68A" />
                    <Stop offset="0.5" stopColor="#F59E0B" />
                    <Stop offset="1" stopColor="#B45309" />
                </LinearGradient>
            </Defs>

            {/* Ana panel */}
            <Rect x="30" y="14" width="280" height="44" rx="6"
                fill="url(#gwGrad)" stroke="url(#goldBorder)" strokeWidth="2.5" />

            {/* Sol kanat */}
            <Path d="M30,36 Q10,20 5,10 Q15,22 20,36 Q10,28 8,36 Q15,32 20,40 Q10,38 12,48 Q20,42 30,40"
                fill="#B45309" stroke="#FDE68A" strokeWidth="0.5" opacity="0.9" />

            {/* Sağ kanat */}
            <Path d="M310,36 Q330,20 335,10 Q325,22 320,36 Q330,28 332,36 Q325,32 320,40 Q330,38 328,48 Q320,42 310,40"
                fill="#B45309" stroke="#FDE68A" strokeWidth="0.5" opacity="0.9" />

            {/* Üst orta süs */}
            <Path d="M155,14 L170,6 L185,14" stroke="#FDE68A" strokeWidth="1.5" fill="none" />
            <Path d="M168,10 L170,6 L172,10 L170,14 Z" fill="#F59E0B" />

            {/* Alt orta süs */}
            <Path d="M155,58 L170,66 L185,58" stroke="#FDE68A" strokeWidth="1.5" fill="none" />
            <Path d="M168,62 L170,66 L172,62 L170,58 Z" fill="#F59E0B" />

            {/* İsim */}
            <SvgText
                x="170" y={38 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#FDE68A"
                fontFamily="System"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── 3. KARANLIK DİKEN ───────────────────────────────────────────
export const NameplateDarkThorn: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { w, h, fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 72">
            <Defs>
                <LinearGradient id="dtGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#4C1D95" />
                    <Stop offset="0.5" stopColor="#7C3AED" />
                    <Stop offset="1" stopColor="#4C1D95" />
                </LinearGradient>
            </Defs>

            {/* Dış dikenler üst */}
            <Path d="M60,16 L65,4 L70,16" fill="#1E1B4B" />
            <Path d="M100,14 L104,4 L108,14" fill="#1E1B4B" />
            <Path d="M160,12 L165,2 L170,12" fill="#1E1B4B" />
            <Path d="M230,14 L234,4 L238,14" fill="#1E1B4B" />
            <Path d="M270,16 L275,4 L280,16" fill="#1E1B4B" />

            {/* Dış dikenler alt */}
            <Path d="M60,56 L65,68 L70,56" fill="#1E1B4B" />
            <Path d="M100,58 L104,68 L108,58" fill="#1E1B4B" />
            <Path d="M160,60 L165,70 L170,60" fill="#1E1B4B" />
            <Path d="M230,58 L234,68 L238,58" fill="#1E1B4B" />
            <Path d="M270,56 L275,68 L280,56" fill="#1E1B4B" />

            {/* Ana panel */}
            <Rect x="20" y="14" width="300" height="44" rx="8"
                fill="url(#dtGrad)" stroke="#312E81" strokeWidth="2" />

            {/* İç çerçeve çizgisi */}
            <Rect x="24" y="18" width="292" height="36" rx="6"
                fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.5" />

            {/* Üst orta elmas */}
            <Path d="M165,14 L170,8 L175,14 L170,20 Z" fill="#A855F7" />

            {/* Alt orta elmas */}
            <Path d="M165,58 L170,52 L175,58 L170,64 Z" fill="#A855F7" />

            {/* İsim */}
            <SvgText
                x="170" y={38 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#EDE9FE"
                fontFamily="System"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── 4. EJDERHA ALEVİ ────────────────────────────────────────────
export const NameplateDragonFlame: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { w, h, fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 72">
            <Defs>
                <LinearGradient id="dfGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#7C2D12" />
                    <Stop offset="0.4" stopColor="#C2410C" />
                    <Stop offset="0.6" stopColor="#EA580C" />
                    <Stop offset="1" stopColor="#7C2D12" />
                </LinearGradient>
                <RadialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor="#FCD34D" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#EA580C" stopOpacity="0" />
                </RadialGradient>
            </Defs>

            {/* Ateş parıltısı */}
            <Ellipse cx="170" cy="36" rx="120" ry="28" fill="url(#fireGlow)" />

            {/* Ana panel */}
            <Rect x="20" y="12" width="300" height="48" rx="8"
                fill="url(#dfGrad)" stroke="#92400E" strokeWidth="2" />

            {/* Altın border */}
            <Rect x="22" y="14" width="296" height="44" rx="7"
                fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />

            {/* Sol alev dili */}
            <Path d="M20,36 Q5,20 10,10 Q12,24 18,30 Q8,28 14,36 Q6,34 12,42 Q16,38 20,44"
                fill="#EA580C" opacity="0.8" />

            {/* Sağ alev dili */}
            <Path d="M320,36 Q335,20 330,10 Q328,24 322,30 Q332,28 326,36 Q334,34 328,42 Q324,38 320,44"
                fill="#EA580C" opacity="0.8" />

            {/* Üst ateş kıvılcımları */}
            <Circle cx="130" cy="10" r="2" fill="#FCD34D" opacity="0.8" />
            <Circle cx="170" cy="6" r="3" fill="#FCD34D" opacity="0.9" />
            <Circle cx="210" cy="10" r="2" fill="#FCD34D" opacity="0.8" />

            {/* İsim */}
            <SvgText
                x="170" y={38 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#FEF3C7"
                fontFamily="System"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── 5. KIZIL PARŞÖMEN ───────────────────────────────────────────
export const NameplateCrimsonScroll: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { w, h, fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 72">
            <Defs>
                <LinearGradient id="csGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#DC2626" />
                    <Stop offset="0.5" stopColor="#B91C1C" />
                    <Stop offset="1" stopColor="#7F1D1D" />
                </LinearGradient>
                <LinearGradient id="scrollEdge" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FCA5A5" />
                    <Stop offset="1" stopColor="#7F1D1D" />
                </LinearGradient>
            </Defs>

            {/* Sol parşömen rulo */}
            <Ellipse cx="28" cy="36" rx="18" ry="28" fill="url(#scrollEdge)" />
            <Ellipse cx="28" cy="36" rx="10" ry="22" fill="#DC2626" />

            {/* Sağ parşömen rulo */}
            <Ellipse cx="312" cy="36" rx="18" ry="28" fill="url(#scrollEdge)" />
            <Ellipse cx="312" cy="36" rx="10" ry="22" fill="#DC2626" />

            {/* Ana panel */}
            <Rect x="28" y="10" width="284" height="52" rx="4"
                fill="url(#csGrad)" />

            {/* Üst süs çizgileri */}
            <Path d="M60,16 Q170,12 280,16" stroke="#FCA5A5" strokeWidth="1" fill="none" opacity="0.5" />
            <Path d="M60,56 Q170,60 280,56" stroke="#FCA5A5" strokeWidth="1" fill="none" opacity="0.5" />

            {/* Arabesk süs */}
            <Path d="M80,36 Q90,28 100,36 Q90,44 80,36 Z" stroke="#FCA5A5" strokeWidth="1" fill="none" opacity="0.4" />
            <Path d="M240,36 Q250,28 260,36 Q250,44 240,36 Z" stroke="#FCA5A5" strokeWidth="1" fill="none" opacity="0.4" />

            {/* İsim */}
            <SvgText
                x="170" y={38 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#FEF2F2"
                fontFamily="System"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── 6. NEON DİKEN ───────────────────────────────────────────────
export const NameplateNeonSpike: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { w, h, fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 72">
            <Defs>
                <LinearGradient id="nsGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#1E1B4B" />
                    <Stop offset="0.5" stopColor="#312E81" />
                    <Stop offset="1" stopColor="#1E1B4B" />
                </LinearGradient>
            </Defs>

            {/* Neon glow katmanı */}
            <Rect x="18" y="16" width="304" height="40" rx="6"
                fill="none" stroke="#A855F7" strokeWidth="4" opacity="0.2" />
            <Rect x="18" y="16" width="304" height="40" rx="6"
                fill="none" stroke="#A855F7" strokeWidth="2" opacity="0.4" />

            {/* Sivri köşe dikenler */}
            <Path d="M20,16 L4,8 L20,20" fill="#1E1B4B" stroke="#7C3AED" strokeWidth="1" />
            <Path d="M320,16 L336,8 L320,20" fill="#1E1B4B" stroke="#7C3AED" strokeWidth="1" />
            <Path d="M20,56 L4,64 L20,52" fill="#1E1B4B" stroke="#7C3AED" strokeWidth="1" />
            <Path d="M320,56 L336,64 L320,52" fill="#1E1B4B" stroke="#7C3AED" strokeWidth="1" />

            {/* Üst dikenler */}
            <Path d="M100,16 L104,6 L108,16" fill="#4C1D95" stroke="#7C3AED" strokeWidth="0.5" />
            <Path d="M166,16 L170,4 L174,16" fill="#4C1D95" stroke="#A855F7" strokeWidth="0.5" />
            <Path d="M232,16 L236,6 L240,16" fill="#4C1D95" stroke="#7C3AED" strokeWidth="0.5" />

            {/* Alt dikenler */}
            <Path d="M100,56 L104,66 L108,56" fill="#4C1D95" stroke="#7C3AED" strokeWidth="0.5" />
            <Path d="M166,56 L170,68 L174,56" fill="#4C1D95" stroke="#A855F7" strokeWidth="0.5" />
            <Path d="M232,56 L236,66 L240,56" fill="#4C1D95" stroke="#7C3AED" strokeWidth="0.5" />

            {/* Ana panel */}
            <Rect x="20" y="16" width="300" height="40" rx="6"
                fill="url(#nsGrad)" stroke="#7C3AED" strokeWidth="1.5" />

            {/* Üst orta kalp/süs */}
            <Path d="M164,16 L170,10 L176,16 L170,22 Z" fill="#7C3AED" />

            {/* Alt orta süs */}
            <Path d="M164,56 L170,62 L176,56 L170,50 Z" fill="#7C3AED" />

            {/* İsim */}
            <SvgText
                x="170" y={38 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#DDD6FE"
                fontFamily="System"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── 7. KRİSTAL GALAKSİ ─────────────────────────────────────────
export const NameplateCrystalGalaxy: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 80">
            <Defs>
                {/* Galaksi ana arka plan */}
                <LinearGradient id="cgBg" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#0D0520" />
                    <Stop offset="0.4" stopColor="#1E0A3C" />
                    <Stop offset="0.6" stopColor="#2D0F52" />
                    <Stop offset="1" stopColor="#0D0520" />
                </LinearGradient>

                {/* Altın çerçeve */}
                <LinearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#78350F" />
                    <Stop offset="0.2" stopColor="#D97706" />
                    <Stop offset="0.4" stopColor="#FDE68A" />
                    <Stop offset="0.6" stopColor="#FDE68A" />
                    <Stop offset="0.8" stopColor="#D97706" />
                    <Stop offset="1" stopColor="#78350F" />
                </LinearGradient>

                {/* Altın dikey */}
                <LinearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FDE68A" />
                    <Stop offset="0.5" stopColor="#F59E0B" />
                    <Stop offset="1" stopColor="#78350F" />
                </LinearGradient>

                {/* Orta galaksi parıltısı */}
                <RadialGradient id="galaxyCenter" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor="#7C3AED" stopOpacity="0.5" />
                    <Stop offset="0.5" stopColor="#4C1D95" stopOpacity="0.25" />
                    <Stop offset="1" stopColor="#1E0A3C" stopOpacity="0" />
                </RadialGradient>

                {/* Kristal gradient */}
                <LinearGradient id="crystalPurple" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#E9D5FF" />
                    <Stop offset="0.3" stopColor="#A855F7" />
                    <Stop offset="1" stopColor="#4C1D95" />
                </LinearGradient>

                <LinearGradient id="crystalLight" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#F5F3FF" />
                    <Stop offset="0.3" stopColor="#C084FC" />
                    <Stop offset="1" stopColor="#6D28D9" />
                </LinearGradient>

                {/* Parlaklık overlay */}
                <LinearGradient id="shineOverlay" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.12" />
                    <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.03" />
                    <Stop offset="1" stopColor="#000000" stopOpacity="0.15" />
                </LinearGradient>
            </Defs>

            {/* ── DIŞA GÖLGE ── */}
            <Rect x="18" y="18" width="308" height="50" rx="8"
                fill="#000000" opacity="0.5" />

            {/* ── ANA PANEL ── */}
            <Rect x="14" y="12" width="312" height="52" rx="8"
                fill="url(#cgBg)" />

            {/* Galaksi orta parıltı */}
            <Ellipse cx="170" cy="38" rx="140" ry="28"
                fill="url(#galaxyCenter)" />

            {/* Parlaklık katmanı */}
            <Rect x="14" y="12" width="312" height="52" rx="8"
                fill="url(#shineOverlay)" />

            {/* ── ALTIN DIŞ ÇERÇEVE ── */}
            <Rect x="14" y="12" width="312" height="52" rx="8"
                fill="none" stroke="url(#goldBorder)" strokeWidth="2.5" />

            {/* Altın iç çerçeve ince */}
            <Rect x="19" y="17" width="302" height="42" rx="6"
                fill="none" stroke="#D97706" strokeWidth="0.8" opacity="0.5" />

            {/* ── YILDIZ TOZU ── */}
            <Circle cx="45" cy="22" r="0.8" fill="#FDE68A" opacity="0.9" />
            <Circle cx="72" cy="18" r="1.2" fill="#E9D5FF" opacity="0.7" />
            <Circle cx="95" cy="26" r="0.7" fill="#FDE68A" opacity="0.8" />
            <Circle cx="120" cy="20" r="1.0" fill="#E9D5FF" opacity="0.6" />
            <Circle cx="145" cy="24" r="0.8" fill="#FDE68A" opacity="0.7" />
            <Circle cx="195" cy="22" r="1.0" fill="#E9D5FF" opacity="0.8" />
            <Circle cx="220" cy="18" r="0.8" fill="#FDE68A" opacity="0.6" />
            <Circle cx="248" cy="25" r="1.2" fill="#E9D5FF" opacity="0.7" />
            <Circle cx="272" cy="20" r="0.7" fill="#FDE68A" opacity="0.9" />
            <Circle cx="295" cy="24" r="1.0" fill="#E9D5FF" opacity="0.6" />
            {/* Alt yıldızlar */}
            <Circle cx="55" cy="54" r="0.8" fill="#E9D5FF" opacity="0.5" />
            <Circle cx="110" cy="58" r="1.0" fill="#FDE68A" opacity="0.4" />
            <Circle cx="230" cy="56" r="0.8" fill="#E9D5FF" opacity="0.5" />
            <Circle cx="285" cy="52" r="1.0" fill="#FDE68A" opacity="0.4" />

            {/* 4 köşe altın yıldız noktaları */}
            {/* Sol üst */}
            <Path d="M22,17 L24,14 L26,17 L24,20 Z" fill="#FDE68A" opacity="0.8" />
            {/* Sağ üst */}
            <Path d="M318,17 L320,14 L322,17 L320,20 Z" fill="#FDE68A" opacity="0.8" />
            {/* Sol alt */}
            <Path d="M22,57 L24,54 L26,57 L24,60 Z" fill="#FDE68A" opacity="0.8" />
            {/* Sağ alt */}
            <Path d="M318,57 L320,54 L322,57 L320,60 Z" fill="#FDE68A" opacity="0.8" />

            {/* ══ SOL KRİSTAL GRUP ══ */}
            {/* Büyük kristal */}
            <Path d="M32,14 L36,2 L39,14 L35,20 Z"
                fill="url(#crystalPurple)" stroke="#C084FC" strokeWidth="0.5" />
            {/* Kristal parlama */}
            <Path d="M34,6 L36,2 L37,8" stroke="#F5F3FF" strokeWidth="0.5" fill="none" opacity="0.7" />

            {/* Orta boy kristal */}
            <Path d="M42,14 L45,5 L48,14 L45,19 Z"
                fill="url(#crystalLight)" stroke="#A855F7" strokeWidth="0.5" opacity="0.9" />
            <Path d="M44,7 L45,4 L46,9" stroke="#F5F3FF" strokeWidth="0.5" fill="none" opacity="0.6" />

            {/* Küçük kristal */}
            <Path d="M50,14 L52,8 L54,14 L52,17 Z"
                fill="#7C3AED" stroke="#C084FC" strokeWidth="0.5" opacity="0.8" />

            {/* Çok küçük kristal */}
            <Path d="M56,14 L57,10 L58,14 L57,16 Z"
                fill="#6D28D9" stroke="#A855F7" strokeWidth="0.5" opacity="0.6" />

            {/* ══ SAĞ KRİSTAL GRUP (ayna) ══ */}
            <Path d="M308,14 L304,2 L301,14 L305,20 Z"
                fill="url(#crystalPurple)" stroke="#C084FC" strokeWidth="0.5" />
            <Path d="M306,6 L304,2 L303,8" stroke="#F5F3FF" strokeWidth="0.5" fill="none" opacity="0.7" />

            <Path d="M298,14 L295,5 L292,14 L295,19 Z"
                fill="url(#crystalLight)" stroke="#A855F7" strokeWidth="0.5" opacity="0.9" />
            <Path d="M296,7 L295,4 L294,9" stroke="#F5F3FF" strokeWidth="0.5" fill="none" opacity="0.6" />

            <Path d="M290,14 L288,8 L286,14 L288,17 Z"
                fill="#7C3AED" stroke="#C084FC" strokeWidth="0.5" opacity="0.8" />

            <Path d="M284,14 L283,10 L282,14 L283,16 Z"
                fill="#6D28D9" stroke="#A855F7" strokeWidth="0.5" opacity="0.6" />

            {/* ══ ÜST ORTA TAÇ ══ */}
            {/* Taç ana yapı */}
            <Path d="M148,12 L152,4 L158,12 L162,6 L166,12 L170,2 L174,12 L178,6 L182,12 L188,4 L192,12"
                stroke="url(#goldBorder)" strokeWidth="2" fill="none" strokeLinejoin="round" />

            {/* Taç dolgu */}
            <Path d="M148,12 L152,4 L158,12 L162,6 L166,12 L170,2 L174,12 L178,6 L182,12 L188,4 L192,12 L192,14 L148,14 Z"
                fill="#1E0A3C" stroke="none" opacity="0.8" />

            {/* Taç üstü küçük elmaslar */}
            <Path d="M169,2 L170,-1 L171,2 L170,5 Z" fill="#FDE68A" />
            <Path d="M161,6 L162,3 L163,6 L162,9 Z" fill="#F59E0B" opacity="0.9" />
            <Path d="M177,6 L178,3 L179,6 L178,9 Z" fill="#F59E0B" opacity="0.9" />
            <Path d="M151,4 L152,1 L153,4 L152,7 Z" fill="#D97706" opacity="0.8" />
            <Path d="M187,4 L188,1 L189,4 L188,7 Z" fill="#D97706" opacity="0.8" />

            {/* ══ ÜST ORTA KRİSTAL ÇUBUK ══ */}
            {/* Fotoğraftaki üst ortadaki mor kristal bar */}
            <Rect x="130" y="10" width="80" height="8" rx="4"
                fill="#3B0764" stroke="url(#goldBorder)" strokeWidth="1" />
            {/* İçi mor parıltı */}
            <Rect x="132" y="11" width="76" height="6" rx="3"
                fill="#7C3AED" opacity="0.6" />
            {/* Orta parlak çizgi */}
            <Path d="M135,14 L205,14" stroke="#C084FC" strokeWidth="0.8" opacity="0.7" />

            {/* Kristal çubuk üstü elmas */}
            <Path d="M167,10 L170,6 L173,10 L170,14 Z"
                fill="#A855F7" stroke="#FDE68A" strokeWidth="0.8" />
            <Path d="M168.5,10 L170,7.5 L171.5,10" fill="#E9D5FF" opacity="0.5" />

            {/* ══ ALT ALTIN SÜSLER ══ */}
            {/* Sol alt elmas */}
            <Path d="M25,64 L29,60 L33,64 L29,68 Z"
                fill="#D97706" stroke="#FDE68A" strokeWidth="0.8" />
            {/* Sağ alt elmas */}
            <Path d="M315,64 L311,60 L307,64 L311,68 Z"
                fill="#D97706" stroke="#FDE68A" strokeWidth="0.8" />

            {/* Alt orta küçük elmas */}
            <Path d="M166,64 L170,60 L174,64 L170,68 Z"
                fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
            <Path d="M168,64 L170,62 L172,64" fill="#FDE68A" opacity="0.5" />

            {/* Alt yatay ince çizgiler */}
            <Path d="M36,64 L160,64" stroke="url(#goldBorder)" strokeWidth="0.8" opacity="0.6" />
            <Path d="M180,64 L304,64" stroke="url(#goldBorder)" strokeWidth="0.8" opacity="0.6" />

            {/* ══ İSİM ══ */}
            {/* Gölge */}
            <SvgText
                x="171" y={42 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#4C1D95"
                fontFamily="System"
                letterSpacing="1.5"
                opacity="0.6"
            >
                {username}
            </SvgText>

            {/* Ana metin */}
            <SvgText
                x="170" y={41 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#F3E8FF"
                fontFamily="System"
                letterSpacing="1.5"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── 8. KARANLIK KELEBEK ─────────────────────────────────────────
export const NameplateDarkButterfly: React.FC<NameplateProps> = ({ username, size = 'small' }) => {
    const { w, h, fontSize } = DIMS[size] || DIMS.small;

    return (
        <Svg width="100%" height="100%" viewBox="0 0 340 72">
            <Defs>
                <LinearGradient id="dbGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#1E293B" />
                    <Stop offset="0.5" stopColor="#0F172A" />
                    <Stop offset="1" stopColor="#020617" />
                </LinearGradient>
            </Defs>

            {/* Ana panel */}
            <Rect x="30" y="12" width="280" height="48" rx="6"
                fill="url(#dbGrad)" stroke="#0EA5E9" strokeWidth="1.5" />

            {/* İnce iç çerçeve */}
            <Rect x="33" y="15" width="274" height="42" rx="5"
                fill="none" stroke="#0EA5E9" strokeWidth="0.5" opacity="0.4" />

            {/* Sol kelebek kanadı üst */}
            <Path d="M30,36 Q15,20 5,14 Q12,22 18,30 Q8,26 10,34 Q18,30 22,38"
                fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" opacity="0.9" />
            {/* Sol kelebek kanadı alt */}
            <Path d="M30,36 Q12,44 8,56 Q16,48 20,40 Q14,46 18,52 Q24,44 28,40"
                fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" opacity="0.7" />

            {/* Sağ kelebek kanadı üst */}
            <Path d="M310,36 Q325,20 335,14 Q328,22 322,30 Q332,26 330,34 Q322,30 318,38"
                fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" opacity="0.9" />
            {/* Sağ kelebek kanadı alt */}
            <Path d="M310,36 Q328,44 332,56 Q324,48 320,40 Q326,46 322,52 Q316,44 312,40"
                fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" opacity="0.7" />

            {/* İnci süs - sol */}
            <Circle cx="36" cy="36" r="2.5" fill="#E2E8F0" />
            <Circle cx="42" cy="30" r="2" fill="#E2E8F0" opacity="0.8" />
            <Circle cx="42" cy="42" r="2" fill="#E2E8F0" opacity="0.8" />

            {/* Arabesk süs - sağ */}
            <Path d="M290,24 Q296,28 300,24 Q296,20 290,24 Z" fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" />
            <Path d="M290,48 Q296,44 300,48 Q296,52 290,48 Z" fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" />

            {/* İsim */}
            <SvgText
                x="170" y={38 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="#BAE6FD"
                fontFamily="System"
            >
                {username}
            </SvgText>
        </Svg>
    );
};

// ─── NAMEPLATE MAP ───────────────────────────────────────────────
export const NAMEPLATE_COMPONENTS: Record<string, React.FC<NameplateProps>> = {
    nametag_thorns_violet: NameplateThornsViolet,
    nametag_golden: NameplateGoldenWing,
    nametag_dark_thorn: NameplateDarkThorn,
    nametag_dragon: NameplateDragonFlame,
    nametag_crimson: NameplateCrimsonScroll,
    nametag_neon: NameplateNeonSpike,
    nametag_galaxy: NameplateCrystalGalaxy,
    nameplate_dark_butterfly: NameplateDarkButterfly,
};