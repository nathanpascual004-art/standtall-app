import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { color as colors } from '@/theme/tokens';

type ProgressChartProps = {
  /** Série de valeurs (au moins 2 points). */
  data: number[];
  height?: number;
};

const PAD = 8;

/** Courbe de progression lissée avec dégradé sous la ligne. */
export function ProgressChart({ data, height = 120 }: ProgressChartProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(event.nativeEvent.layout.width);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points =
    width > 0 && data.length > 1
      ? data.map((value, index) => ({
          x: PAD + (index / (data.length - 1)) * (width - PAD * 2),
          y: PAD + (1 - (value - min) / range) * (height - PAD * 2),
        }))
      : [];

  // Lissage par quadratiques passant par les milieux de segments.
  let line = '';
  if (points.length > 1) {
    line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      line += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    line += ` L ${last.x} ${last.y}`;
  }

  const area = line
    ? `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : '';

  return (
    <View onLayout={onLayout} style={{ height }}>
      {line ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.28} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#chartFill)" />
          <Path
            d={line}
            stroke={colors.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
          <Circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={4}
            fill={colors.accent}
          />
        </Svg>
      ) : null}
    </View>
  );
}
