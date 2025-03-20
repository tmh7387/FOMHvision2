'use client';

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface AircraftDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  aircraft: any;
  onEdit: () => void;
  onDelete: () => void;
}

const AircraftDetails = ({ 
  isOpen, 
  onClose, 
  aircraft, 
  onEdit, 
  onDelete 
}: AircraftDetailsProps) => {
  const [activeTab, setActiveTab] = useState('specifications');
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isOpen && activeTab === '3dModel' && modelContainerRef.current) {
      initThreeJS();
    }
    
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isOpen, activeTab]);
  
  const initThreeJS = () => {
    if (!modelContainerRef.current) return;
    
    // Clear previous renderer
    if (rendererRef.current && modelContainerRef.current.contains(rendererRef.current.domElement)) {
      modelContainerRef.current.removeChild(rendererRef.current.domElement);
    }
    
    // Get container dimensions
    const width = modelContainerRef.current.clientWidth;
    const height = 400; // Fixed height
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8f9fa);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 0, 5);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    modelContainerRef.current.appendChild(renderer.domElement);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // For demo purposes, create a simple helicopter model
    // In a real implementation, you would load actual 3D models
    createSimpleHelicopterModel(scene);
    
    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!modelContainerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = modelContainerRef.current.clientWidth;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };
  
  const createSimpleHelicopterModel = (scene: THREE.Scene) => {
    // Create a group to hold the helicopter model
    const group = new THREE.Group();
    scene.add(group);
    
    let helicopterColor = 0x3B82F6; // Default blue color
    
    // Try to match the color based on aircraft type (in a real app, this would be more sophisticated)
    if (aircraft.type.includes('EC120')) {
      helicopterColor = 0x10B981; // Green for EC120
    } else if (aircraft.type.includes('AS350')) {
      helicopterColor = 0xF59E0B; // Yellow for AS350
    } else if (aircraft.type.includes('H125')) {
      helicopterColor = 0xEF4444; // Red for H125
    }
    
    // Main body
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
    bodyGeometry.rotateZ(Math.PI / 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: helicopterColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.7, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    cockpitGeometry.translate(1.2, 0, 0);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x3498db, 
      transparent: true, 
      opacity: 0.7 
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    group.add(cockpit);
    
    // Main rotor
    const rotorGeometry = new THREE.BoxGeometry(0.1, 5, 0.1);
    const rotorMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
    rotor.position.set(0, 0, 0.7);
    group.add(rotor);
    
    // Tail boom
    const tailBoomGeometry = new THREE.CylinderGeometry(0.2, 0.1, 2, 8);
    tailBoomGeometry.rotateZ(Math.PI / 2);
    tailBoomGeometry.translate(-2, 0, 0);
    const tailBoomMaterial = new THREE.MeshPhongMaterial({ color: helicopterColor });
    const tailBoom = new THREE.Mesh(tailBoomGeometry, tailBoomMaterial);
    group.add(tailBoom);
    
    // Tail rotor
    const tailRotorGeometry = new THREE.BoxGeometry(0.1, 1, 0.05);
    const tailRotorMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    const tailRotor = new THREE.Mesh(tailRotorGeometry, tailRotorMaterial);
    tailRotor.position.set(-3, 0, 0);
    tailRotor.rotateX(Math.PI / 2);
    group.add(tailRotor);
    
    // Skids
    const skidGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    skidGeometry.rotateZ(Math.PI / 2);
    const skidMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    
    const leftSkid = new THREE.Mesh(skidGeometry, skidMaterial);
    leftSkid.position.set(0, 0.5, -0.7);
    group.add(leftSkid);
    
    const rightSkid = new THREE.Mesh(skidGeometry, skidMaterial);
    rightSkid.position.set(0, -0.5, -0.7);
    group.add(rightSkid);
    
    // Add struts connecting body to skids
    const strutGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);
    const strutMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    
    const frontLeftStrut = new THREE.Mesh(strutGeometry, strutMaterial);
    frontLeftStrut.position.set(0.6, 0.5, -0.35);
    frontLeftStrut.rotation.x = Math.PI / 2;
    group.add(frontLeftStrut);
    
    const frontRightStrut = new THREE.Mesh(strutGeometry, strutMaterial);
    frontRightStrut.position.set(0.6, -0.5, -0.35);
    frontRightStrut.rotation.x = Math.PI / 2;
    group.add(frontRightStrut);
    
    const rearLeftStrut = new THREE.Mesh(strutGeometry, strutMaterial);
    rearLeftStrut.position.set(-0.6, 0.5, -0.35);
    rearLeftStrut.rotation.x = Math.PI / 2;
    group.add(rearLeftStrut);
    
    const rearRightStrut = new THREE.Mesh(strutGeometry, strutMaterial);
    rearRightStrut.position.set(-0.6, -0.5, -0.35);
    rearRightStrut.rotation.x = Math.PI / 2;
    group.add(rearRightStrut);
    
    // Animate rotors
    const animateRotors = () => {
      rotor.rotation.z += 0.1;
      tailRotor.rotation.y += 0.2;
      requestAnimationFrame(animateRotors);
    };
    
    animateRotors();
    
    // Position and scale the model
    group.scale.set(1.5, 1.5, 1.5);
    group.rotation.y = Math.PI / 4;
  };
  
  if (!aircraft) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <div className="flex items-center">
              {aircraft.type}
              <Badge className="ml-2">
                Registration(s): {Array.isArray(aircraft.registration) 
                  ? aircraft.registration.join(', ') 
                  : aircraft.registration
                }
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={onEdit}
              >
                <Edit size={16} />
                <span>Edit</span>
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex items-center gap-1"
                onClick={onDelete}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="aspect-video mb-6 overflow-hidden rounded-md">
            <img
              src={aircraft.imageUrl}
              alt={aircraft.type}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {aircraft.capabilities && aircraft.capabilities.map((capability: string, index: number) => (
              <Badge key={index} variant="outline">
                {capability}
              </Badge>
            ))}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="3dModel">3D Model</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>
            
            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Specification</th>
                      <th className="text-left p-3 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3 font-medium">Type</td>
                      <td className="p-3">{aircraft.type}</td>
                    </tr>
                    
                    {/* Add status if available */}
                    {aircraft.status && (
                      <tr className="border-t">
                        <td className="p-3 font-medium">Status</td>
                        <td className="p-3">{aircraft.status}</td>
                      </tr>
                    )}
                    
                    {aircraft.specifications && (
                      <>
                        <tr className="border-t">
                          <td className="p-3 font-medium">Passenger Capacity</td>
                          <td className="p-3">{aircraft.specifications.passenger_capacity}</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3 font-medium">Max Takeoff Weight</td>
                          <td className="p-3">{aircraft.specifications.max_takeoff_weight}</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3 font-medium">Max Cruise Speed</td>
                          <td className="p-3">{aircraft.specifications.max_cruise_speed}</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3 font-medium">Range</td>
                          <td className="p-3">{aircraft.specifications.range}</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3 font-medium">Service Ceiling</td>
                          <td className="p-3">{aircraft.specifications.service_ceiling}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {aircraft.capabilities && aircraft.capabilities.map((capability: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Special Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {aircraft.special_equipment && aircraft.special_equipment.map((equipment: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* 3D Model Tab */}
            <TabsContent value="3dModel" className="space-y-4">
              <div 
                ref={modelContainerRef} 
                className="w-full h-[400px] bg-gray-100 rounded-md"
              />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Interactive 3D Model. Click and drag to rotate, scroll to zoom.</p>
                <p>Note: This is a simplified generic model. In a production environment, detailed models of each aircraft type would be available.</p>
              </div>
            </TabsContent>
            
            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Inspections</h3>
                {aircraft.maintenance && aircraft.maintenance.inspections && aircraft.maintenance.inspections.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Inspection Type</th>
                          <th className="text-left p-3 font-medium">Interval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aircraft.maintenance.inspections.map((inspection: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 font-medium">{inspection.type}</td>
                            <td className="p-3">{inspection.interval}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No inspection records available.</p>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
                {aircraft.maintenance && aircraft.maintenance.common_issues && aircraft.maintenance.common_issues.length > 0 ? (
                  <ul className="list-disc pl-6 space-y-2">
                    {aircraft.maintenance.common_issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No common issues documented.</p>
                )}
              </div>
            </TabsContent>
            
            {/* Configuration Tab */}
            <TabsContent value="configuration" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Configuration Details</h3>
                <p className="text-muted-foreground mb-4">{aircraft.configuration}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-100 rounded-md p-4">
                    <h4 className="font-medium mb-2">Base Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {aircraft.base_location && aircraft.base_location.map((location: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-md p-4">
                    <h4 className="font-medium mb-2">Special Equipment</h4>
                    <div className="flex flex-wrap gap-2">
                      {aircraft.special_equipment && aircraft.special_equipment.map((equipment: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Configuration Image</h3>
                <div className="bg-gray-100 rounded-md p-4">
                  <img 
                    src="/api/placeholder/800/400" 
                    alt="Aircraft configuration diagram" 
                    className="w-full rounded-md"
                  />
                  <p className="text-sm text-center mt-2">Standard configuration layout</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AircraftDetails;
