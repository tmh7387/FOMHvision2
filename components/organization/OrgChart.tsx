'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  departmentColor: string;
  children?: OrgNode[];
  responsibilities?: string[];
  reportsTo?: string;
  interfaces?: string[];
  authorityLimits?: string;
}

export default function OrgChart() {
  const [data, setData] = useState<OrgNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOrgData() {
      try {
        const { data: departments, error: deptError } = await supabase
          .from('departments')
          .select('*');

        const { data: positions, error: posError } = await supabase
          .from('positions')
          .select('*');

        if (deptError || posError) {
          throw new Error(deptError?.message || posError?.message);
        }

        // Transform the flat data into a hierarchical structure
        const hierarchicalData = transformDataToHierarchy(departments, positions);
        setData(hierarchicalData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching organization data",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
        
        // Use demo data for the prototype
        setData(DEMO_ORG_DATA);
      } finally {
        setLoading(false);
      }
    }

    fetchOrgData();
  }, [toast]);

  useEffect(() => {
    if (data && svgRef.current) {
      renderOrgChart();
    }
  }, [data]);

  const renderOrgChart = () => {
    if (!data || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 600;
    
    // Create a tree layout
    const hierarchy = d3.hierarchy(data);
    
    const treeLayout = d3.tree<OrgNode>()
      .size([width - 100, height - 100])
      .nodeSize([150, 200]);
    
    const root = treeLayout(hierarchy);
    
    // Create links
    svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y + 50)
        .y((d: any) => d.x + 50));
    
    // Create nodes
    const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y + 50},${d.x + 50})`);
    
    // Add node rectangles
    node.append("rect")
      .attr("x", -60)
      .attr("y", -25)
      .attr("width", 120)
      .attr("height", 50)
      .attr("rx", 6)
      .attr("fill", (d: any) => d.data.departmentColor || "#1f77b4")
      .attr("cursor", "pointer")
      .on("click", (event, d: any) => {
        setSelectedNode(d.data);
        setIsDialogOpen(true);
      });
    
    // Add node text
    node.append("text")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d: any) => d.data.name)
      .attr("font-size", 12);
    
    node.append("text")
      .attr("dy", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d: any) => d.data.title)
      .attr("font-size", 10);
  };

  const handleFilterView = (filterType: string) => {
    toast({
      title: "Filter Applied",
      description: `Filtered by ${filterType}`,
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading organization chart...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button onClick={() => handleFilterView("Department")}>
          View by Department
        </Button>
        <Button onClick={() => handleFilterView("Function")}>
          View by Function
        </Button>
        <Button onClick={() => handleFilterView("Location")}>
          View by Location
        </Button>
        <Button variant="outline" onClick={() => renderOrgChart()}>
          Reset View
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4 overflow-auto">
          <svg 
            ref={svgRef} 
            className="w-full" 
            style={{ minWidth: '800px', height: '600px' }}
          />
        </CardContent>
      </Card>
      
      {selectedNode && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedNode.name}</DialogTitle>
              <DialogDescription>{selectedNode.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="font-medium">Department</h4>
                <p className="text-sm text-muted-foreground">{selectedNode.department}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Reports To</h4>
                <p className="text-sm text-muted-foreground">{selectedNode.reportsTo || 'None'}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Key Responsibilities</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                  {selectedNode.responsibilities?.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Interfaces With</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                  {selectedNode.interfaces?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Authority Limits</h4>
                <p className="text-sm text-muted-foreground">{selectedNode.authorityLimits}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Helper function to transform flat data into hierarchical structure
function transformDataToHierarchy(departments: any[], positions: any[]): OrgNode {
  // This is a simplified implementation
  // In a real application, you would build the hierarchy from the database data
  return DEMO_ORG_DATA;
}

// Demo data for prototype
const DEMO_ORG_DATA: OrgNode = {
  id: "ceo",
  name: "Jane Smith",
  title: "Chief Executive Officer",
  department: "Executive Leadership",
  departmentColor: "#1E40AF",
  responsibilities: [
    "Strategic direction",
    "Business development",
    "Final authority in major decisions",
    "Ultimate accountability for safety"
  ],
  reportsTo: "Board of Directors",
  interfaces: ["Board", "Executive Team", "Regulatory Authorities"],
  authorityLimits: "Can approve expenditures up to $500,000",
  children: [
    {
      id: "coo",
      name: "Michael Chen",
      title: "Chief Operating Officer",
      department: "Executive Leadership",
      departmentColor: "#1E40AF",
      responsibilities: [
        "Oversee day-to-day operations",
        "Implement strategic initiatives",
        "Resource allocation"
      ],
      reportsTo: "CEO",
      interfaces: ["CEO", "Department Directors", "Key Clients"],
      authorityLimits: "Can approve expenditures up to $250,000",
      children: [
        {
          id: "dir-ops",
          name: "Sarah Johnson",
          title: "Director of Flight Operations",
          department: "Flight Operations",
          departmentColor: "#3B82F6",
          responsibilities: [
            "Oversee all flying activities",
            "Ensure adherence to safety protocols",
            "Crew management"
          ],
          reportsTo: "COO",
          interfaces: ["COO", "Chief Pilot", "Safety Manager"],
          authorityLimits: "Can approve expenditures up to $50,000",
          children: [
            {
              id: "chief-pilot",
              name: "Robert Davis",
              title: "Chief Pilot",
              department: "Flight Operations",
              departmentColor: "#3B82F6",
              responsibilities: [
                "Lead pilot team",
                "Training oversight",
                "SOP development"
              ],
              reportsTo: "Director of Flight Operations",
              interfaces: ["Director of Flight Operations", "Pilots", "Training Manager"],
              authorityLimits: "Can approve flight-specific decisions"
            }
          ]
        },
        {
          id: "dir-maint",
          name: "David Lee",
          title: "Director of Maintenance",
          department: "Engineering & Maintenance",
          departmentColor: "#10B981",
          responsibilities: [
            "Aircraft maintenance oversight",
            "Regulatory compliance",
            "Maintenance planning"
          ],
          reportsTo: "COO",
          interfaces: ["COO", "Maintenance Team", "Regulators"],
          authorityLimits: "Can approve maintenance expenditures up to $75,000"
        },
        {
          id: "safety-manager",
          name: "Priya Sharma",
          title: "Safety Manager",
          department: "Safety & Compliance",
          departmentColor: "#EF4444",
          responsibilities: [
            "SMS oversight",
            "Safety culture development",
            "Incident investigation"
          ],
          reportsTo: "COO",
          interfaces: ["COO", "All Departments", "Regulatory Authorities"],
          authorityLimits: "Can ground aircraft for safety concerns"
        }
      ]
    },
    {
      id: "cfo",
      name: "Thomas Wilson",
      title: "Chief Financial Officer",
      department: "Executive Leadership",
      departmentColor: "#1E40AF",
      responsibilities: [
        "Financial management",
        "Budgeting",
        "Investment decisions"
      ],
      reportsTo: "CEO",
      interfaces: ["CEO", "Department Directors", "Investors"],
      authorityLimits: "Can approve financial decisions up to $200,000"
    },
    {
      id: "commercial",
      name: "Elena Rodriguez",
      title: "Commercial Director",
      department: "Commercial",
      departmentColor: "#8B5CF6",
      responsibilities: [
        "Sales strategy",
        "Marketing",
        "Client relationships"
      ],
      reportsTo: "CEO",
      interfaces: ["CEO", "Sales Team", "Key Clients"],
      authorityLimits: "Can negotiate contracts up to $300,000"
    }
  ]
};