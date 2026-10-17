import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

const nodes: DiagramNode[] = [
  {
    id: 'camera',
    label: 'RTSP / Video Feed',
    sublabel: 'Surveillance Stream',
    x: 40,
    y: 130,
    width: 150,
    height: 70,
    description:
      'High-frame-rate RTSP or USB camera streams capturing aerial/overhead crowd footage in public gathering locations and event choke points.',
  },
  {
    id: 'opencv',
    label: 'OpenCV Capture',
    sublabel: 'Frame Decoding',
    x: 230,
    y: 130,
    width: 150,
    height: 70,
    description:
      'Efficient thread-isolated frame grabbing, normalization, and hardware-accelerated video color-space conversion using OpenCV.',
  },
  {
    id: 'yolo',
    label: 'YOLOv8 Detection',
    sublabel: 'CUDA / Jetson Nano',
    x: 420,
    y: 130,
    width: 165,
    height: 70,
    description:
      'GPU-accelerated deep neural network bounding box detection tailored for human head/pedestrian classes, optimized for sub-50 ms edge inference latency.',
  },
  {
    id: 'bytetrack',
    label: 'ByteTrack Engine',
    sublabel: 'Multi-Object Tracking',
    x: 625,
    y: 130,
    width: 160,
    height: 70,
    description:
      'Association tracker matching low-confidence detections and maintaining persistent identity tracks across frame occlusions and crowd clumping.',
  },
  {
    id: 'density_analysis',
    label: 'Density & Velocity',
    sublabel: 'Spatial Vector Calc',
    x: 520,
    y: 260,
    width: 170,
    height: 65,
    description:
      'Mathematical computation of regional crowd density per square metre, tracking directional entropy and velocity anomalies to identify turbulent flow.',
  },
  {
    id: 'alert',
    label: 'Stampede Alert',
    sublabel: 'Early Warning Event',
    x: 740,
    y: 260,
    width: 155,
    height: 65,
    description:
      'Threshold-triggered early-warning broadcast alerting control-room monitors when density surges or localized movement vectors indicate high risk.',
  },
];

const links: DiagramLink[] = [
  { from: 'camera', to: 'opencv', label: 'Raw Frames' },
  { from: 'opencv', to: 'yolo', label: 'Tensors' },
  { from: 'yolo', to: 'bytetrack', label: 'Detections' },
  { from: 'bytetrack', to: 'density_analysis', label: 'Trajectories' },
  { from: 'density_analysis', to: 'alert', label: 'Risk Threshold', dashed: true },
];

export const CrowdDiagram: React.FC = () => {
  return (
    <Diagram
      title="Real-Time Crowd Analytics Architecture"
      nodes={nodes}
      links={links}
      width={940}
      height={360}
    />
  );
};
