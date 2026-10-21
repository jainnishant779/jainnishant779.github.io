import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

// Stack from the CV: Python, Flask, dlib, MySQL, AWS EC2. Outcome: ~90% less manual attendance time in a 3-course pilot.
const nodes: DiagramNode[] = [
  {
    id: 'input',
    label: 'Image / Video Input',
    sublabel: 'Faces to recognise',
    x: 40,
    y: 150,
    width: 180,
    height: 70,
    description: 'Images of people to be recognised for attendance.',
  },
  {
    id: 'dlib',
    label: 'dlib Face Recognition',
    sublabel: 'Python',
    x: 270,
    y: 150,
    width: 190,
    height: 70,
    description: 'Automated facial recognition using dlib.',
  },
  {
    id: 'mysql',
    label: 'MySQL',
    sublabel: 'Attendance data',
    x: 510,
    y: 150,
    width: 150,
    height: 70,
    description: 'Attendance data stored in MySQL.',
  },
  {
    id: 'flask_ec2',
    label: 'Flask on AWS EC2',
    sublabel: 'Full-stack web app',
    x: 710,
    y: 150,
    width: 190,
    height: 70,
    description:
      'Flask application deployed on AWS EC2. It reduced manual attendance-taking time by ~90% in a 3-course pilot.',
  },
];

const links: DiagramLink[] = [
  { from: 'input', to: 'dlib', label: 'Frames' },
  { from: 'dlib', to: 'mysql', label: 'Matches' },
  { from: 'mysql', to: 'flask_ec2', label: 'Records' },
];

export const FacialAttendanceDiagram: React.FC = () => {
  return (
    <Diagram
      title="Facial Recognition Attendance — Simplified Architecture"
      nodes={nodes}
      links={links}
      width={930}
      height={300}
    />
  );
};
