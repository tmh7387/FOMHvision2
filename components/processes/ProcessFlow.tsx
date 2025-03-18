'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  UserCircle,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface ProcessStep {
  id: string;
  name: string;
  description: string;
  department: string;
  departmentColor: string;
  personnelResponsible: string;
  procedureReference: string;
  criticalSafetyPoints?: string[];
  decisionAuthority?: string;
  toolsUsed?: string[];
  documentationRequired?: string[];
  commonIssues?: string[];
  icon: 'clipboard' | 'user' | 'clock' | 'file' | 'alert' | 'check';
  isSafetyCritical: boolean;
}

interface ProcessPhase {
  name: string;
  steps: ProcessStep[];
}

interface OperationType {
  id: string;
  name: string;
  phases: ProcessPhase[];
}

const DEMO_OPERATIONS: OperationType[] = [
  {
    id: 'scenic',
    name: 'Scenic Tourism Operations',
    phases: [
      {
        name: 'Pre-Flight Phase',
        steps: [
          {
            id: 'booking',
            name: 'Booking and Scheduling',
            description: 'Process customer bookings for scenic flights, allocate time slots, and manage passenger information.',
            department: 'Commercial',
            departmentColor: '#8B5CF6',
            personnelResponsible: 'Booking Agent',
            procedureReference: 'SOP-COM-01, Section 2',
            documentationRequired: ['Passenger manifest', 'Booking confirmation form'],
            commonIssues: ['Last-minute booking changes', 'Weight and balance constraints with multiple passengers'],
            icon: 'clipboard',
            isSafetyCritical: false
          },
          {
            id: 'weather',
            name: 'Weather Assessment',
            description: 'Comprehensive evaluation of current and forecast weather conditions along the planned scenic route.',
            department: 'Flight Operations',
            departmentColor: '#3B82F6',
            personnelResponsible: 'Operations Officer, Pilot-in-Command',
            procedureReference: 'SOP-OPS-04, Section 3',
            criticalSafetyPoints: [
              'Visibility requirements: minimum 5km',
              'Wind limitations: maximum 25 knots',
              'Thunderstorm proximity: minimum 10NM clearance'
            ],
            decisionAuthority: 'Final assessment by PIC',
            toolsUsed: ['METAR', 'Meteorological forecast', 'Visual observations'],
            documentationRequired: ['Weather briefing form'],
            commonIssues: ['Rapidly changing monsoon conditions', 'Localized weather phenomena not in forecasts'],
            icon: 'alert',
            isSafetyCritical: true
          },
          {
            id: 'aircraft-prep',
            name: 'Aircraft Preparation',
            description: 'Preparation of the helicopter for the scheduled scenic flight, including fueling and pre-flight inspection.',
            department: 'Maintenance',
            departmentColor: '#10B981',
            personnelResponsible: 'Aircraft Technician, Pilot-in-Command',
            procedureReference: 'SOP-MNT-02, Section 4',
            criticalSafetyPoints: [
              'Fuel quantity verification',
              'Control systems check',
              'Rotor system inspection'
            ],
            toolsUsed: ['Fuel dipstick', 'Inspection checklist', 'Torque wrench'],
            documentationRequired: ['Pre-flight inspection log', 'Maintenance release form'],
            commonIssues: ['FOD on landing areas', 'Minor maintenance discoveries during inspection'],
            icon: 'check',
            isSafetyCritical: true
          },
          {
            id: 'passenger-briefing',
            name: 'Passenger Briefing',
            description: 'Safety briefing for passengers, including emergency procedures, boarding/deboarding, and in-flight expectations.',
            department: 'Flight Operations',
            departmentColor: '#3B82F6',
            personnelResponsible: 'Pilot-in-Command or Ground Crew',
            procedureReference: 'SOP-OPS-07, Section 2',
            criticalSafetyPoints: [
              'Emergency exit operation',
              'Approaching/departing helicopter safely',
              'Use of seatbelts and headsets'
            ],
            documentationRequired: ['Passenger briefing checklist'],
            commonIssues: ['Language barriers with international tourists', 'Distracted passengers taking photos'],
            icon: 'user',
            isSafetyCritical: true
          }
        ]
      },
      {
        name: 'Flight Execution Phase',
        steps: [
          {
            id: 'takeoff',
            name: 'Takeoff Procedures',
            description: 'Safe execution of helicopter takeoff for scenic flight, including final checks and ATC coordination.',
            department: 'Flight Operations',
            departmentColor: '#3B82F6',
            personnelResponsible: 'Pilot-in-Command',
            procedureReference: 'SOP-OPS-10, Section 3',
            criticalSafetyPoints: [
              'Power check before liftoff',
              'Obstacle clearance path',
              'Abort criteria and procedures'
            ],
            decisionAuthority: 'Pilot-in-Command',
            commonIssues: ['Changing wind conditions during takeoff', 'Weight and balance variations'],
            icon: 'alert',
            isSafetyCritical: true
          },
          {
            id: 'route-execution',
            name: 'Scenic Route Navigation',
            description: 'Flying the planned scenic route while providing commentary and ensuring passenger comfort and safety.',
            department: 'Flight Operations',
            departmentColor: '#3B82F6',
            personnelResponsible: 'Pilot-in-Command',
            procedureReference: 'SOP-OPS-12, Section 2',
            toolsUsed: ['GPS navigation', 'Route maps', 'Radio communication'],
            commonIssues: ['Other air traffic in popular scenic areas', 'Passenger photo requests requiring course adjustments'],
            icon: 'check',
            isSafetyCritical: false
          },
          {
            id: 'landing',
            name: 'Landing Procedures',
            description: 'Safe execution of helicopter landing at the conclusion of the scenic flight.',
            department: 'Flight Operations',
            departmentColor: '#3B82F6',
            personnelResponsible: 'Pilot-in-Command',
            procedureReference: 'SOP-OPS-15, Section 4',
            criticalSafetyPoints: [
              'Landing site assessment',
              'Approach path selection',
              'Go-around criteria'
            ],
            decisionAuthority: 'Pilot-in-Command',
            commonIssues: ['Changing wind conditions during approach', 'FOD at landing area'],
            icon: 'alert',
            isSafetyCritical: true
          }
        ]
      },
      {
        name: 'Post-Flight Phase',
        steps: [
          {
            id: 'aircraft-securing',
            name: 'Aircraft Securing',
            description: 'Proper shutdown and securing of the helicopter after completion of the scenic flight.',
            department: 'Flight Operations',
            departmentColor: '#3B82F6',
            personnelResponsible: 'Pilot-in-Command',
            procedureReference: 'SOP-OPS-18, Section 1',
            documentationRequired: ['Post-flight checklist'],
            icon: 'check',
            isSafetyCritical: false
          },
          {
            id: 'documentation',
            name: 'Flight Documentation',
            description: 'Completion of all required post-flight documentation, including flight logs and technical log entries.',
            department: 'Flight Operations',
            departmentColor: '#3B82F6',
            personnelResponsible: 'Pilot-in-Command',
            procedureReference: 'SOP-OPS-20, Section 2',
            documentationRequired: ['Journey log', 'Flight time record', 'Technical log entry'],
            icon: 'file',
            isSafetyCritical: false
          },
          {
            id: 'maintenance-feedback',
            name: 'Maintenance Feedback',
            description: 'Communication of any aircraft issues or observations to the maintenance department.',
            department: 'Maintenance',
            departmentColor: '#10B981',
            personnelResponsible: 'Pilot-in-Command, Maintenance Controller',
            procedureReference: 'SOP-MNT-09, Section 3',
            documentationRequired: ['Defect report form (if applicable)'],
            commonIssues: ['Minor discrepancies that don\'t affect airworthiness', 'Trending issues requiring monitoring'],
            icon: 'clipboard',
            isSafetyCritical: false
          }
        ]
      }
    ]
  },
  {
    id: 'charter',
    name: 'Executive Charter Operations',
    phases: [
      {
        name: 'Pre-Flight Phase',
        steps: [
          {
            id: 'vip-coordination',
            name: 'VIP Client Coordination',
            description: 'Detailed coordination with executive clients regarding schedule, requirements, and preferences.',
            department: 'Commercial',
            departmentColor: '#8B5CF6',
            personnelResponsible: 'VIP Services Coordinator',
            procedureReference: 'SOP-COM-05, Section 3',
            documentationRequired: ['VIP passenger details', 'Special request form'],
            icon: 'user',
            isSafetyCritical: false
          }
        ]
      }
    ]
  },
  {
    id: 'offshore',
    name: 'Offshore Support Operations',
    phases: [
      {
        name: 'Pre-Flight Phase',
        steps: [
          {
            id: 'cargo-preparation',
            name: 'Cargo and Equipment Preparation',
            description: 'Preparation and verification of cargo, equipment, and dangerous goods for offshore transport.',
            department: 'Ground Operations',
            departmentColor: '#F59E0B',
            personnelResponsible: 'Loading Supervisor, Dangerous Goods Inspector',
            procedureReference: 'SOP-GRD-04, Section 2',
            criticalSafetyPoints: [
              'Dangerous goods verification',
              'Weight and balance calculation',
              'Cargo securing procedures'
            ],
            documentationRequired: ['Cargo manifest', 'Dangerous goods declaration', 'Load sheet'],
            icon: 'alert',
            isSafetyCritical: true
          }
        ]
      }
    ]
  }
];

export default function ProcessFlow() {
  const [operationTypes, setOperationTypes] = useState<OperationType[]>(DEMO_OPERATIONS);
  const [selectedOperation, setSelectedOperation] = useState<string>('scenic');
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchProcessData() {
      try {
        const { data, error } = await supabase
          .from('operational_processes')
          .select('*');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setOperationTypes(data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching process data",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchProcessData();
  }, [toast]);
  
  const getStepIcon = (iconType: string) => {
    switch (iconType) {
      case 'clipboard':
        return <ClipboardList className="h-6 w-6" />;
      case 'user':
        return <UserCircle className="h-6 w-6" />;
      case 'clock':
        return <Clock className="h-6 w-6" />;
      case 'file':
        return <FileText className="h-6 w-6" />;
      case 'alert':
        return <AlertTriangle className="h-6 w-6" />;
      case 'check':
        return <CheckCircle2 className="h-6 w-6" />;
      default:
        return <ClipboardList className="h-6 w-6" />;
    }
  };
  
  const handleStepClick = (step: ProcessStep) => {
    setSelectedStep(step);
    setIsDialogOpen(true);
  };
  
  const handleFilterSafetyCritical = () => {
    toast({
      title: "Filter Applied",
      description: "Showing only safety-critical steps",
    });
  };
  
  const handleFilterByDepartment = (department: string) => {
    toast({
      title: "Filter Applied",
      description: `Showing steps for ${department} department`,
    });
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading process data...</div>;
  }
  
  const currentOperation = operationTypes.find(op => op.id === selectedOperation) || operationTypes[0];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Risk Assessment Matrix</h2>
          <p className="text-muted-foreground">
            Visualizing operational hazards and their control measures
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs 
          defaultValue={selectedOperation} 
          onValueChange={setSelectedOperation}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3">
            {operationTypes.map(op => (
              <TabsTrigger key={op.id} value={op.id}>
                {op.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button onClick={handleFilterSafetyCritical} variant="outline">
          <AlertCircle className="mr-2 h-4 w-4" />
          Safety-Critical Only
        </Button>
        <Button onClick={() => handleFilterByDepartment('Flight Operations')} variant="outline">
          Flight Operations
        </Button>
        <Button onClick={() => handleFilterByDepartment('Maintenance')} variant="outline">
          Maintenance
        </Button>
        <Button onClick={() => handleFilterByDepartment('Commercial')} variant="outline">
          Commercial
        </Button>
      </div>
      
      <div className="mb-8">
        {currentOperation.phases.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{phase.name}</h3>
            <div className="relative">
              <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
              
              <div className="space-y-4 relative z-10">
                {phase.steps.map((step, stepIndex) => (
                  <Card 
                    key={stepIndex}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      step.isSafetyCritical ? 'border-red-400 border-2' : ''
                    }`}
                    onClick={() => handleStepClick(step)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div 
                          className="flex items-center justify-center w-8 h-8 rounded-full mr-4"
                          style={{ backgroundColor: step.departmentColor }}
                        >
                          {getStepIcon(step.icon)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{step.name}</h4>
                            <Badge variant={step.isSafetyCritical ? "destructive" : "outline"}>
                              {step.department}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedStep && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <div 
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full mr-3"
                  style={{ backgroundColor: selectedStep.departmentColor }}
                >
                  {getStepIcon(selectedStep.icon)}
                </div>
                {selectedStep.name}
                {selectedStep.isSafetyCritical && (
                  <Badge variant="destructive" className="ml-3">Safety-Critical</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedStep.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <h4 className="font-medium">Department Responsible</h4>
                <p className="text-sm text-muted-foreground">{selectedStep.department}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Personnel Responsible</h4>
                <p className="text-sm text-muted-foreground">{selectedStep.personnelResponsible}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Procedure Reference</h4>
                <p className="text-sm text-muted-foreground">{selectedStep.procedureReference}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Decision Authority</h4>
                <p className="text-sm text-muted-foreground">{selectedStep.decisionAuthority || 'N/A'}</p>
              </div>
              
              {selectedStep.criticalSafetyPoints && selectedStep.criticalSafetyPoints.length > 0 && (
                <div className="col-span-2">
                  <h4 className="font-medium">Critical Safety Points</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {selectedStep.criticalSafetyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedStep.toolsUsed && selectedStep.toolsUsed.length > 0 && (
                <div>
                  <h4 className="font-medium">Tools Used</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {selectedStep.toolsUsed.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedStep.documentationRequired && selectedStep.documentationRequired.length > 0 && (
                <div>
                  <h4 className="font-medium">Documentation Required</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {selectedStep.documentationRequired.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedStep.commonIssues && selectedStep.commonIssues.length > 0 && (
                <div className="col-span-2">
                  <h4 className="font-medium">Common Issues</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {selectedStep.commonIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}