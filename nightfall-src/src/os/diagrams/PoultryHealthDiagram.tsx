import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

// The CV describes this project as an end-to-end ML lifecycle for a farm-operator client:
// data collection, annotation, training, deployment — with Python, YOLO, OpenCV and object detection.
const nodes: DiagramNode[] = [
  {
    id: 'collect',
    label: 'Data Collection',
    sublabel: 'Farm client data',
    x: 40,
    y: 150,
    width: 170,
    height: 70,
    description: 'Collecting data for the farm-operator client.',
  },
  {
    id: 'annotate',
    label: 'Annotation',
    sublabel: 'Labelled dataset',
    x: 270,
    y: 150,
    width: 170,
    height: 70,
    description: 'Annotating the collected data to build a training dataset.',
  },
  {
    id: 'train',
    label: 'YOLO Training',
    sublabel: 'Object detection',
    x: 500,
    y: 150,
    width: 170,
    height: 70,
    description: 'Training a YOLO object-detection model on the annotated data.',
  },
  {
    id: 'deploy',
    label: 'Deployment',
    sublabel: 'Python · OpenCV',
    x: 730,
    y: 150,
    width: 170,
    height: 70,
    description: 'Deploying the trained detector for the client, using Python and OpenCV.',
  },
];

const links: DiagramLink[] = [
  { from: 'collect', to: 'annotate', label: 'Raw data' },
  { from: 'annotate', to: 'train', label: 'Labels' },
  { from: 'train', to: 'deploy', label: 'Model' },
];

export const PoultryHealthDiagram: React.FC = () => {
  return (
    <Diagram
      title="Poultry Health Monitoring — ML Lifecycle (simplified)"
      nodes={nodes}
      links={links}
      width={930}
      height={300}
    />
  );
};
