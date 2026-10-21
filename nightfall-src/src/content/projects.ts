import type { Project } from './types';

/**
 * Source of truth: Nishant's CV (cv_extracted.txt). Do not add projects, metrics or links that are not in the CV.
 * All code is private; the only public link is the GitHub profile.
 */
export const projects: Project[] = [
  {
    slug: 'edgedesk',
    title: 'EdgeDesk: Secure Multi-Device Remote Access Platform',
    subtitle: 'Remote Access Platform',
    category: 'Edge AI',
    badge: 'Patent Application Filed — Not Granted',
    stack: ['Python', 'WebSocket', 'VNC', 'Jetson Nano', 'TLS/WSS'],
    description: [
      'VPN-style secure remote desktop for encrypted screen access and file transfer across a fleet of Jetson Nano edge devices; patent application filed for the multi-device architecture.',
      'Custom WebSocket broker with encrypted file transfer and cross-device drag-and-drop, managing multiple devices from one dashboard with reboot-safe Linux services.',
    ],
    image: '/nightfall/images/projects/edgedesk.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'crowd-analytics',
    title: 'Real-Time Crowd Analytics & Stampede Detection',
    subtitle: 'Stampede Detection',
    category: 'Computer Vision',
    badge: 'Top Finalist — MPSEDC Mahakumbh 2025 (200+ teams)',
    stack: ['Python', 'YOLOv8', 'ByteTrack', 'OpenCV', 'Jetson Nano (CUDA)'],
    description: [
      'GPU-accelerated multi-object tracking pipeline achieving sub-50 ms inference latency for real-time person counting and density/velocity-based stampede alerts.',
    ],
    image: '/nightfall/images/projects/crowd-analytics.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'poultry-health-ai',
    title: 'AI-Powered Poultry Health Monitoring',
    subtitle: 'Client project · ML lifecycle',
    category: 'Computer Vision',
    badge: 'Client Project',
    stack: ['Python', 'YOLO', 'OpenCV', 'Object Detection'],
    description: [
      'Owned the ML lifecycle end-to-end — data collection, annotation, training, and deployment — for a real farm-operator client.',
    ],
    image: '/nightfall/images/projects/poultry-health-ai.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'on-device-ai',
    title: 'On-Device AI Assistant (Offline Speech & Local LLM)',
    subtitle: 'Offline STT + LLM',
    category: 'Research',
    badge: 'Personal R&D — In Progress, Not a Released App',
    stack: ['Android', 'Whisper', 'sherpa-onnx', 'llama.cpp', 'GGUF'],
    description: [
      'Offline speech transcription and local language-model inference running fully on an Android device without cloud dependencies.',
    ],
    image: '/nightfall/images/projects/on-device-ai.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'facial-attendance',
    title: 'AI-Accelerated Facial Recognition Attendance System',
    subtitle: 'Facial Recognition Platform',
    category: 'AI/ML',
    badge: 'Pilot Deployment',
    stack: ['Python', 'Flask', 'dlib', 'MySQL', 'AWS EC2'],
    description: [
      'Full-stack attendance system deployed on AWS EC2, reducing manual attendance-taking time by ~90% for a 3-course pilot through automated facial recognition.',
    ],
    image: '/nightfall/images/projects/facial-attendance.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
];
