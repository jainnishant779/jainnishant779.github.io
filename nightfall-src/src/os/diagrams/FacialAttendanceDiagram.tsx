import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

const nodes: DiagramNode[] = [
  {
    id: 'capture',
    label: 'Classroom Camera',
    sublabel: 'RTSP Stream / Entrance',
    x: 40,
    y: 130,
    width: 165,
    height: 70,
    description:
      'Checkpoint optical camera stream capturing students entering university classrooms and exam halls.',
  },
  {
    id: 'dlib_landmarks',
    label: 'dlib 68-Point Mesh',
    sublabel: 'Facial Landmark Align',
    x: 250,
    y: 130,
    width: 170,
    height: 70,
    description:
      'dlib HOG face detector and 68-point facial landmark predictor correcting face yaw, pitch, and roll into an aligned normalized facial crop.',
  },
  {
    id: 'embedding',
    label: 'Deep Feature Extractor',
    sublabel: '128D ResNet Embedding',
    x: 465,
    y: 130,
    width: 175,
    height: 70,
    description:
      'Deep metric learning network computing a dense 128-dimensional biometric embedding invariant to illumination and facial angle.',
  },
  {
    id: 'matcher',
    label: 'Cosine Matcher',
    sublabel: '99.2% Biometric Match',
    x: 685,
    y: 130,
    width: 170,
    height: 70,
    description:
      'High-speed Euclidean & Cosine distance comparison against pre-enrolled student facial roster stored in MySQL with threshold validation.',
  },
  {
    id: 'aws_cloud',
    label: 'AWS EC2 Attendance API',
    sublabel: 'Flask REST & Cloud DB',
    x: 465,
    y: 260,
    width: 195,
    height: 65,
    description:
      'Flask microservice deployed on AWS EC2 recording timestamped verification records, reducing manual attendance logging by ~90% across pilot courses.',
  },
];

const links: DiagramLink[] = [
  { from: 'capture', to: 'dlib_landmarks', label: 'Video Frames' },
  { from: 'dlib_landmarks', to: 'embedding', label: 'Aligned Crop' },
  { from: 'embedding', to: 'matcher', label: '128D Vector' },
  { from: 'matcher', to: 'aws_cloud', label: 'Verified ID', dashed: true },
];

export const FacialAttendanceDiagram: React.FC = () => {
  return (
    <Diagram
      title="AI Facial Recognition Attendance Architecture"
      nodes={nodes}
      links={links}
      width={930}
      height={360}
    />
  );
};
