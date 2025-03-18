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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface RiskControl {
  id: string;
  description: string;
}

interface RiskAssessment {
  id: string;
  hazard: string;
  description: string;
  consequences: string[];
  inherentLikelihood: number;
  inherentSeverity: number;
  inherentRisk: string;
  controls: RiskControl[];
  residualLikelihood: number;
  residualSeverity: number;
  residualRisk: string;
  responsiblePerson: string;
  monitoringMethod: string;
  category: string;
}

export default function RiskMatrix() {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const [showResidual, setShowResidual] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const { toast } = useToast();
  
  const severityLevels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
  const likelihoodLevels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  
  useEffect(() => {
    async function fetchRiskData() {
      try {
        const { data, error } = await supabase
          .from('risk_assessments')
          .select('*');
          
        if (error) throw error;
        
        setRiskAssessments(DEMO_RISK_ASSESSMENTS);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching risk data",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
        
        setRiskAssessments(DEMO_RISK_ASSESSMENTS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRiskData();
  }, [toast]);
  
  const getRiskColor = (likelihood: number, severity: number) => {
    const risk = likelihood * severity;
    
    if (risk >= 20) return 'bg-red-500 hover:bg-red-600';
    if (risk >= 13) return 'bg-orange-500 hover:bg-orange-600';
    if (risk >= 6) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };
  
  const getRiskForCell = (likelihood: number, severity: number) => {
    return riskAssessments.filter(risk => {
      if (showResidual) {
        return risk.residualLikelihood === likelihood && risk.residualSeverity === severity;
      } else {
        return risk.inherentLikelihood === likelihood && risk.inherentSeverity === severity;
      }
    });
  };
  
  const handleRiskClick = (risk: RiskAssessment) => {
    setSelectedRisk(risk);
    setIsDialogOpen(true);
  };
  
  const toggleResidualView = () => {
    setShowResidual(!showResidual);
  };
  
  const handleFilterChange = (category: string | null) => {
    setFilter(category);
  };
  
  const filteredRisks = filter 
    ? riskAssessments.filter(risk => risk.category === filter)
    : riskAssessments;
  
  const categories = Array.from(new Set(riskAssessments.map(risk => risk.category)));
  
  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading risk matrix...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Risk Assessment Matrix</h2>
          <p className="text-muted-foreground">
            Visualizing operational hazards and their control measures
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="residual-mode"
            checked={showResidual}
            onCheckedChange={toggleResidualView}
          />
          <Label htmlFor="residual-mode">
            {showResidual ? 'Showing Residual Risk' : 'Showing Inherent Risk'}
          </Label>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={filter === null ? "default" : "outline"}
          onClick={() => handleFilterChange(null)}
        >
          All Risks
        </Button>
        {categories.map(category => (
          <Button 
            key={category}
            variant={filter === category ? "default" : "outline"}
            onClick={() => handleFilterChange(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {showResidual ? 'Residual Risk Matrix (After Controls)' : 'Inherent Risk Matrix (Before Controls)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 w-32"></th>
                  {severityLevels.map((severity, index) => (
                    <th 
                      key={severity} 
                      className="border p-2 text-center bg-gray-100"
                    >
                      {severity}<br/>{index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {likelihoodLevels.map((likelihood, likelihoodIndex) => (
                  <tr key={likelihood}>
                    <th className="border p-2 text-left bg-gray-100">
                      {likelihood}<br/>{5 - likelihoodIndex}
                    </th>
                    {severityLevels.map((severity, severityIndex) => {
                      const cellLikelihood = 5 - likelihoodIndex;
                      const cellSeverity = severityIndex + 1;
                      const risksInCell = getRiskForCell(cellLikelihood, cellSeverity);
                      
                      return (
                        <td 
                          key={`${likelihood}-${severity}`} 
                          className={`border p-0 text-center relative ${
                            getRiskColor(cellLikelihood, cellSeverity)
                          }`}
                        >
                          <div className="p-2 h-24 overflow-y-auto">
                            {risksInCell.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {risksInCell.map(risk => (
                                  <Button 
                                    key={risk.id}
                                    variant="ghost"
                                    className="text-white text-xs p-1 h-auto whitespace-nowrap overflow-hidden text-ellipsis"
                                    onClick={() => handleRiskClick(risk)}
                                  >
                                    {risk.hazard}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-white text-xs">
                                {cellLikelihood * cellSeverity}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div>
              <span className="text-sm">Low (1-5)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-yellow-500 mr-2"></div>
              <span className="text-sm">Medium (6-12)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-orange-500 mr-2"></div>
              <span className="text-sm">High (13-19)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-red-500 mr-2"></div>
              <span className="text-sm">Extreme (20-25)</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedRisk && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedRisk.hazard}
                <Badge 
                  variant="outline" 
                  className="ml-2"
                >
                  {selectedRisk.category}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedRisk.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2">
                <h4 className="font-medium">Potential Consequences</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
                  {selectedRisk.consequences.map((consequence, index) => (
                    <li key={index}>{consequence}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Inherent Risk</h4>
                <div className="flex items-center mt-2">
                  <Badge className={`${getRiskColor(selectedRisk.inherentLikelihood, selectedRisk.inherentSeverity)} border-none text-white`}>
                    {selectedRisk.inherentRisk}
                  </Badge>
                  <span className="text-sm ml-2">
                    (Likelihood: {selectedRisk.inherentLikelihood}, Severity: {selectedRisk.inherentSeverity})
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Residual Risk</h4>
                <div className="flex items-center mt-2">
                  <Badge className={`${getRiskColor(selectedRisk.residualLikelihood, selectedRisk.residualSeverity)} border-none text-white`}>
                    {selectedRisk.residualRisk}
                  </Badge>
                  <span className="text-sm ml-2">
                    (Likelihood: {selectedRisk.residualLikelihood}, Severity: {selectedRisk.residualSeverity})
                  </span>
                </div>
              </div>
              
              <div className="col-span-2">
                <h4 className="font-medium">Control Measures</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
                  {selectedRisk.controls.map((control, index) => (
                    <li key={index}>{control.description}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Responsible Person</h4>
                <p className="text-sm text-muted-foreground mt-2">{selectedRisk.responsiblePerson}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Monitoring Method</h4>
                <p className="text-sm text-muted-foreground mt-2">{selectedRisk.monitoringMethod}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Demo data for prototype
const DEMO_RISK_ASSESSMENTS: RiskAssessment[] = [
  {
    id: 'risk-001',
    hazard: 'Weather Deterioration',
    description: 'Sudden degradation of visibility during monsoon season operations',
    consequences: [
      'Forced landing in unsuitable terrain',
      'Spatial disorientation',
      'Controlled flight into terrain (CFIT)',
      'Passenger injuries'
    ],
    inherentLikelihood: 4,
    inherentSeverity: 5,
    inherentRisk: 'Extreme (20)',
    controls: [
      { id: 'control-001', description: 'Conservative weather minimums above regulatory requirements' },
      { id: 'control-002', description: 'Extensive local weather knowledge training' },
      { id: 'control-003', description: 'Multiple weather information sources' },
      { id: 'control-004', description: 'Predetermined turn-back points and protocols' },
      { id: 'control-005', description: 'Weather radar equipment in all aircraft' }
    ],
    residualLikelihood: 2,
    residualSeverity: 5,
    residualRisk: 'High (10)',
    responsiblePerson: 'Director of Flight Operations',
    monitoringMethod: 'Weather-related incident reports, pilot feedback, flight data monitoring',
    category: 'Weather'
  },
  {
    id: 'risk-002',
    hazard: 'Bird Strike',
    description: 'Collision with birds during low-altitude scenic flights',
    consequences: [
      'Windshield penetration',
      'Engine damage or failure',
      'Control surface damage',
      'Forced landing'
    ],
    inherentLikelihood: 4,
    inherentSeverity: 4,
    inherentRisk: 'High (16)',
    controls: [
      { id: 'control-006', description: 'Bird hazard awareness in route planning' },
      { id: 'control-007', description: 'Avoidance of known bird concentration areas' },
      { id: 'control-008', description: 'Reduced airspeed in high-risk areas' },
      { id: 'control-009', description: 'Enhanced windshield specifications' }
    ],
    residualLikelihood: 3,
    residualSeverity: 3,
    residualRisk: 'Medium (9)',
    responsiblePerson: 'Chief Pilot',
    monitoringMethod: 'Bird strike reports, seasonal migration pattern updates',
    category: 'Wildlife'
  },
  {
    id: 'risk-003',
    hazard: 'Confined Area Operations',
    description: 'Landing in confined areas with limited approach/departure paths',
    consequences: [
      'Tail rotor strike',
      'Main rotor strike',
      'Dynamic rollover',
      'Brownout/whiteout conditions'
    ],
    inherentLikelihood: 3,
    inherentSeverity: 5,
    inherentRisk: 'High (15)',
    controls: [
      { id: 'control-010', description: 'Confined area operations training for all pilots' },
      { id: 'control-011', description: 'Pre-approved landing site database with hazard information' },
      { id: 'control-012', description: 'Ground reconnaissance procedures' },
      { id: 'control-013', description: 'Dual-pilot operations for new landing sites' },
      { id: 'control-014', description: 'Minimum approach/departure path requirements' }
    ],
    residualLikelihood: 2,
    residualSeverity: 4,
    residualRisk: 'Medium (8)',
    responsiblePerson: 'Chief Pilot',
    monitoringMethod: 'Landing site assessment reports, incident data tracking',
    category: 'Landing Sites'
  },
  {
    id: 'risk-004',
    hazard: 'Engine Failure',
    description: 'Single engine failure during critical phases of flight',
    consequences: [
      'Forced autorotation landing',
      'Aircraft damage',
      'Passenger injuries',
      'Fatal accident'
    ],
    inherentLikelihood: 2,
    inherentSeverity: 5,
    inherentRisk: 'High (10)',
    controls: [
      { id: 'control-015', description: 'Enhanced maintenance program exceeding manufacturer requirements' },
      { id: 'control-016', description: 'Regular emergency procedures training in simulator' },
      { id: 'control-017', description: 'Continuous flight path assessment training' },
      { id: 'control-018', description: 'Route planning to maximize autorotation landing options' },
      { id: 'control-019', description: 'Enhanced engine monitoring systems' }
    ],
    residualLikelihood: 1,
    residualSeverity: 5,
    residualRisk: 'Medium (5)',
    responsiblePerson: 'Director of Maintenance',
    monitoringMethod: 'Engine trend monitoring, borescope inspections, parts replacement tracking',
    category: 'Mechanical'
  },
  {
    id: 'risk-005',
    hazard: 'FOD Ingestion',
    description: 'Foreign Object Debris ingestion during takeoff/landing at unprepared sites',
    consequences: [
      'Engine damage',
      'Engine power loss',
      'Compressor stalls',
      'Forced landing'
    ],
    inherentLikelihood: 3,
    inherentSeverity: 4,
    inherentRisk: 'High (12)',
    controls: [
      { id: 'control-020', description: 'FOD inspection procedures for all landing sites' },
      { id: 'control-021', description: 'Particle separator systems on all aircraft' },
      { id: 'control-022', description: 'Pilot training on FOD avoidance techniques' },
      { id: 'control-023', description: 'Ground crew FOD awareness training' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRisk: 'Medium (6)',
    responsiblePerson: 'Director of Maintenance',
    monitoringMethod: 'FOD incident reports, engine inspection findings',
    category: 'Mechanical'
  },
  {
    id: 'risk-006',
    hazard: 'Passenger Behavior',
    description: 'Unsafe passenger behavior during flight operations',
    consequences: [
      'Interference with flight controls',
      'Distraction of pilot',
      'Disruption of center of gravity',
      'Personal injuries'
    ],
    inherentLikelihood: 3,
    inherentSeverity: 3,
    inherentRisk: 'Medium (9)',
    controls: [
      { id: 'control-024', description: 'Comprehensive pre-flight passenger briefing' },
      { id: 'control-025', description: 'Passenger management training for pilots' },
      { id: 'control-026', description: 'Physical barriers to prevent access to controls' },
      { id: 'control-027', description: 'Clear and visible safety placards in multiple languages' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRisk: 'Low (4)',
    responsiblePerson: 'Chief Pilot',
    monitoringMethod: 'Passenger behavior incident reports, pilot feedback',
    category: 'Passengers'
  },
  {
    id: 'risk-007',
    hazard: 'Night Operations',
    description: 'Operations during hours of darkness, particularly in areas with limited ground lighting',
    consequences: [
      'Spatial disorientation',
      'Controlled flight into terrain',
      'Loss of situational awareness',
      'Landing in unsuitable areas'
    ],
    inherentLikelihood: 3,
    inherentSeverity: 5,
    inherentRisk: 'High (15)',
    controls: [
      { id: 'control-028', description: 'Enhanced night operations training beyond regulatory requirements' },
      { id: 'control-029', description: 'Night vision imaging systems (NVIS) for critical operations' },
      { id: 'control-030', description: 'Illuminated landing site equipment' },
      { id: 'control-031', description: 'Multi-crew operations for complex night missions' },
      { id: 'control-032', description: 'Conservative weather minimums for night operations' }
    ],
    residualLikelihood: 2,
    residualSeverity: 4,
    residualRisk: 'Medium (8)',
    responsiblePerson: 'Director of Flight Operations',
    monitoringMethod: 'Night operations tracking, incident reports, NVIS equipment checks',
    category: 'Operations'
  },
  {
    id: 'risk-008',
    hazard: 'Pilot Fatigue',
    description: 'Pilot fatigue due to irregular scheduling, consecutive duty days, or circadian disruption',
    consequences: [
      'Impaired decision making',
      'Reduced situational awareness',
      'Slower reaction times',
      'Procedural errors'
    ],
    inherentLikelihood: 4,
    inherentSeverity: 4,
    inherentRisk: 'High (16)',
    controls: [
      { id: 'control-033', description: 'Fatigue risk management system beyond regulatory requirements' },
      { id: 'control-034', description: 'Conservative duty time limitations' },
      { id: 'control-035', description: 'Fatigue awareness training for pilots and schedulers' },
      { id: 'control-036', description: 'Non-punitive fatigue reporting system' },
      { id: 'control-037', description: 'Bio-mathematical fatigue modeling for complex schedules' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRisk: 'Medium (6)',
    responsiblePerson: 'Director of Flight Operations',
    monitoringMethod: 'Fatigue reports, duty time monitoring, sleep quality assessments',
    category: 'Human Factors'
  },
  {
    id: 'risk-009',
    hazard: 'Maintenance Error',
    description: 'Critical maintenance error leading to in-flight system failure',
    consequences: [
      'Aircraft system malfunction',
      'Control system failure',
      'Forced landing',
      'Aircraft damage or loss'
    ],
    inherentLikelihood: 3,
    inherentSeverity: 5,
    inherentRisk: 'High (15)',
    controls: [
      { id: 'control-038', description: 'Detailed task cards with verification steps' },
      { id: 'control-039', description: 'Independent inspection requirements for critical systems' },
      { id: 'control-040', description: 'Maintenance human factors training program' },
      { id: 'control-041', description: 'Non-punitive error reporting system' },
      { id: 'control-042', description: 'Maintenance quality assurance program' }
    ],
    residualLikelihood: 1,
    residualSeverity: 5,
    residualRisk: 'Medium (5)',
    responsiblePerson: 'Director of Maintenance',
    monitoringMethod: 'Maintenance error reports, quality assurance findings, test flight reports',
    category: 'Maintenance'
  }
];