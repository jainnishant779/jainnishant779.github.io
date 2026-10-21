/**
 * Simplified architecture flows, one per project. Every node comes from the project's CV description
 * (see src/content/projects.ts); do not add protocol versions, metrics or components the CV does not mention.
 */
export interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  description: string;
  /** 1-based grid position and column span inside the flow's grid. */
  col: number;
  row: number;
  span?: number;
}

export interface FlowLink {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface Flow {
  /** Matches the project slug in projects.ts. */
  slug: string;
  title: string;
  cols: number;
  nodes: FlowNode[];
  links: FlowLink[];
}

export const flows: Flow[] = [
  {
    slug: 'edgedesk',
    title: 'EdgeDesk — simplified architecture',
    cols: 4,
    nodes: [
      { id: 'edge_devices', label: 'Jetson Nano Devices', sublabel: 'VNC · Linux services', col: 1, row: 1,
        description: 'A fleet of NVIDIA Jetson Nano edge devices. Each exposes its screen over VNC and runs reboot-safe Linux services.' },
      { id: 'tls_tunnel', label: 'TLS / WSS Channel', sublabel: 'Encrypted transport', col: 2, row: 1,
        description: 'Encrypted WebSocket (WSS) transport between the edge devices and the broker.' },
      { id: 'ws_broker', label: 'Custom WS Broker', sublabel: 'Python', col: 3, row: 1,
        description: 'Custom Python WebSocket broker that connects the edge devices to the dashboard.' },
      { id: 'dashboard', label: 'Dashboard', sublabel: 'Multi-device control', col: 4, row: 1,
        description: 'A single dashboard used to manage multiple edge devices — encrypted screen access and file transfer.' },
      { id: 'file_channel', label: 'Encrypted File Transfer', sublabel: 'Cross-device drag-and-drop', col: 2, row: 2, span: 2,
        description: 'Encrypted file transfer between devices, with cross-device drag-and-drop.' },
    ],
    links: [
      { from: 'edge_devices', to: 'tls_tunnel', label: 'Screen' },
      { from: 'tls_tunnel', to: 'ws_broker', label: 'Encrypted' },
      { from: 'ws_broker', to: 'dashboard', label: 'Control' },
      { from: 'edge_devices', to: 'file_channel', label: 'Files', dashed: true },
      { from: 'file_channel', to: 'dashboard', label: 'Drag & drop', dashed: true },
    ],
  },
  {
    slug: 'crowd-analytics',
    title: 'Crowd Analytics — simplified pipeline',
    cols: 4,
    nodes: [
      { id: 'camera', label: 'Camera Feed', sublabel: 'Video input', col: 1, row: 1,
        description: 'Video input of a crowd scene.' },
      { id: 'opencv', label: 'OpenCV Capture', sublabel: 'Frame handling', col: 2, row: 1,
        description: 'OpenCV reads the video and prepares frames for the detector.' },
      { id: 'yolo', label: 'YOLOv8 Detection', sublabel: 'CUDA / Jetson Nano', col: 3, row: 1,
        description: 'YOLOv8 person detection, GPU-accelerated (CUDA) on a Jetson Nano.' },
      { id: 'bytetrack', label: 'ByteTrack', sublabel: 'Multi-object tracking', col: 4, row: 1,
        description: 'ByteTrack keeps a persistent track for each detected person across frames.' },
      { id: 'density', label: 'Density & Velocity', sublabel: 'Person counting', col: 3, row: 2,
        description: 'Real-time person counting, plus density and velocity analysis computed from the tracks.' },
      { id: 'alert', label: 'Stampede Alert', sublabel: 'Density / velocity based', col: 4, row: 2,
        description: 'Stampede alerts raised from density and velocity. The pipeline reaches sub-50 ms inference latency.' },
    ],
    links: [
      { from: 'camera', to: 'opencv', label: 'Frames' },
      { from: 'opencv', to: 'yolo', label: 'Images' },
      { from: 'yolo', to: 'bytetrack', label: 'Detections' },
      { from: 'bytetrack', to: 'density', label: 'Tracks' },
      { from: 'density', to: 'alert', label: 'Alert', dashed: true },
    ],
  },
  {
    slug: 'poultry-health-ai',
    title: 'Poultry Health Monitoring — ML lifecycle (simplified)',
    cols: 4,
    nodes: [
      { id: 'collect', label: 'Data Collection', sublabel: 'Farm client data', col: 1, row: 1,
        description: 'Collecting data for the farm-operator client.' },
      { id: 'annotate', label: 'Annotation', sublabel: 'Labelled dataset', col: 2, row: 1,
        description: 'Annotating the collected data to build a training dataset.' },
      { id: 'train', label: 'YOLO Training', sublabel: 'Object detection', col: 3, row: 1,
        description: 'Training a YOLO object-detection model on the annotated data.' },
      { id: 'deploy', label: 'Deployment', sublabel: 'Python · OpenCV', col: 4, row: 1,
        description: 'Deploying the trained detector for the client, using Python and OpenCV.' },
    ],
    links: [
      { from: 'collect', to: 'annotate', label: 'Raw data' },
      { from: 'annotate', to: 'train', label: 'Labels' },
      { from: 'train', to: 'deploy', label: 'Model' },
    ],
  },
  {
    slug: 'on-device-ai',
    title: 'On-Device Assistant — simplified pipeline (personal R&D)',
    cols: 4,
    nodes: [
      { id: 'speech', label: 'Speech Input', sublabel: 'Android device', col: 1, row: 1,
        description: 'Speech captured on the Android device.' },
      { id: 'whisper', label: 'Whisper STT', sublabel: 'via sherpa-onnx', col: 2, row: 1,
        description: 'Offline speech transcription with Whisper-based recognition running through sherpa-onnx — no cloud.' },
      { id: 'llm', label: 'llama.cpp + GGUF', sublabel: 'Local LLM inference', col: 3, row: 1,
        description: 'A local language model in GGUF format, run with llama.cpp directly on the device.' },
      { id: 'output', label: 'Text Response', sublabel: 'On device', col: 4, row: 1,
        description: 'The response is produced fully on the device, without cloud dependencies.' },
    ],
    links: [
      { from: 'speech', to: 'whisper', label: 'Audio' },
      { from: 'whisper', to: 'llm', label: 'Transcript' },
      { from: 'llm', to: 'output', label: 'Tokens', dashed: true },
    ],
  },
  {
    slug: 'facial-attendance',
    title: 'Facial Recognition Attendance — simplified architecture',
    cols: 4,
    nodes: [
      { id: 'input', label: 'Image / Video Input', sublabel: 'Faces to recognise', col: 1, row: 1,
        description: 'Images of people to be recognised for attendance.' },
      { id: 'dlib', label: 'dlib Face Recognition', sublabel: 'Python', col: 2, row: 1,
        description: 'Automated facial recognition using dlib.' },
      { id: 'mysql', label: 'MySQL', sublabel: 'Attendance data', col: 3, row: 1,
        description: 'Attendance data stored in MySQL.' },
      { id: 'flask_ec2', label: 'Flask on AWS EC2', sublabel: 'Full-stack web app', col: 4, row: 1,
        description: 'Flask application deployed on AWS EC2. It reduced manual attendance-taking time by ~90% in a 3-course pilot.' },
    ],
    links: [
      { from: 'input', to: 'dlib', label: 'Frames' },
      { from: 'dlib', to: 'mysql', label: 'Matches' },
      { from: 'mysql', to: 'flask_ec2', label: 'Records' },
    ],
  },
];

export const getFlow = (slug: string): Flow | undefined => flows.find((f) => f.slug === slug);
