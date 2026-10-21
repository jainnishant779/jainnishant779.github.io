import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

// Simplified pipeline. Stack and outcome come straight from the CV (YOLOv8, ByteTrack, OpenCV, Jetson Nano/CUDA, sub-50 ms).
const nodes: DiagramNode[] = [
  {
    id: 'camera',
    label: 'Camera Feed',
    sublabel: 'Video input',
    x: 40,
    y: 130,
    width: 150,
    height: 70,
    description: 'Video input of a crowd scene.',
  },
  {
    id: 'opencv',
    label: 'OpenCV Capture',
    sublabel: 'Frame handling',
    x: 230,
    y: 130,
    width: 150,
    height: 70,
    description: 'OpenCV reads the video and prepares frames for the detector.',
  },
  {
    id: 'yolo',
    label: 'YOLOv8 Detection',
    sublabel: 'CUDA / Jetson Nano',
    x: 420,
    y: 130,
    width: 165,
    height: 70,
    description: 'YOLOv8 person detection, GPU-accelerated (CUDA) on a Jetson Nano.',
  },
  {
    id: 'bytetrack',
    label: 'ByteTrack',
    sublabel: 'Multi-object tracking',
    x: 625,
    y: 130,
    width: 160,
    height: 70,
    description: 'ByteTrack keeps a persistent track for each detected person across frames.',
  },
  {
    id: 'density_analysis',
    label: 'Density & Velocity',
    sublabel: 'Person counting',
    x: 520,
    y: 260,
    width: 170,
    height: 65,
    description: 'Real-time person counting, plus density and velocity analysis computed from the tracks.',
  },
  {
    id: 'alert',
    label: 'Stampede Alert',
    sublabel: 'Density / velocity based',
    x: 740,
    y: 260,
    width: 155,
    height: 65,
    description:
      'Stampede alerts raised from density and velocity. The pipeline reaches sub-50 ms inference latency.',
  },
];

const links: DiagramLink[] = [
  { from: 'camera', to: 'opencv', label: 'Frames' },
  { from: 'opencv', to: 'yolo', label: 'Images' },
  { from: 'yolo', to: 'bytetrack', label: 'Detections' },
  { from: 'bytetrack', to: 'density_analysis', label: 'Tracks' },
  { from: 'density_analysis', to: 'alert', label: 'Alert', dashed: true },
];

export const CrowdDiagram: React.FC = () => {
  return (
    <Diagram
      title="Crowd Analytics — Simplified Pipeline"
      nodes={nodes}
      links={links}
      width={940}
      height={360}
    />
  );
};
