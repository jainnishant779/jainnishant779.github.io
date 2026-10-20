import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

const nodes: DiagramNode[] = [
  {
    id: 'camera',
    label: 'RTSP Farm Cameras',
    sublabel: 'Overhead Coop Feeds',
    x: 40,
    y: 130,
    width: 165,
    height: 70,
    description:
      'Continuous 30 FPS RTSP video streams captured from overhead industrial cameras mounted in real farm operator sheds.',
  },
  {
    id: 'preprocessing',
    label: 'Frame Preprocessor',
    sublabel: 'CLAHE & Contrast',
    x: 250,
    y: 130,
    width: 165,
    height: 70,
    description:
      'Contrast-limited adaptive histogram equalization and frame normalization compensating for harsh sunlight, dust, and dim poultry coop lighting.',
  },
  {
    id: 'yolo',
    label: 'YOLO Detection',
    sublabel: 'Flock Localization',
    x: 460,
    y: 130,
    width: 165,
    height: 70,
    description:
      'Custom fine-tuned YOLO object detector trained on farm datasets to extract individual bird bounding boxes and spatial centroids in real time.',
  },
  {
    id: 'anomaly',
    label: 'Behavioral Anomaly',
    sublabel: 'Lethargy & Density Calc',
    x: 670,
    y: 130,
    width: 180,
    height: 70,
    description:
      'Temporal movement tracker monitoring individual flock velocity vectors. Flags stationary birds, severe clustering, and abnormal postures (98.4% anomaly precision).',
  },
  {
    id: 'alert_daemon',
    label: 'Operator Telemetry',
    sublabel: 'Real-Time Edge Alerts',
    x: 460,
    y: 260,
    width: 190,
    height: 65,
    description:
      'Edge-deployed alert daemon notifying the farm operator dashboard instantly when threshold anomalies exceed safety levels.',
  },
];

const links: DiagramLink[] = [
  { from: 'camera', to: 'preprocessing', label: 'RTSP Stream' },
  { from: 'preprocessing', to: 'yolo', label: 'Tensors' },
  { from: 'yolo', to: 'anomaly', label: 'Detections' },
  { from: 'anomaly', to: 'alert_daemon', label: 'Risk Threshold', dashed: true },
];

export const PoultryHealthDiagram: React.FC = () => {
  return (
    <Diagram
      title="AI-Powered Poultry Health Monitoring Pipeline"
      nodes={nodes}
      links={links}
      width={930}
      height={360}
    />
  );
};
