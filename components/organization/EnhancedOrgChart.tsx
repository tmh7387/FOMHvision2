'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  RefreshCw, 
  Edit,
  Trash2,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';

interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  location: string;
  manager_id: string | null;
  email?: string;
  phone?: string;
  bio?: string;
}

interface TreeNode extends d3.HierarchyNode<Employee> {
  x: number;
  y: number;
  x0?: number;
  y0?: number;
}

const EnhancedOrgChart = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const form = useForm<Employee>({
    defaultValues: {
      name: '',
      title: '',
      department: '',
      location: '',
      email: '',
      phone: '',
      bio: '',
      manager_id: null,
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      if (!supabase) {
        toast({
          title: 'Error',
          description: 'Database connection not available',
          variant: 'destructive',
        });
        return;
      }

      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('id');
      
      if (error) throw error;
      
      if (employees) {
        setData(employees);
        renderOrgChart(employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees data',
        variant: 'destructive',
      });
    }
  };

  const renderOrgChart = (employees: Employee[]) => {
    if (!svgRef.current || !containerRef.current || employees.length === 0) return;

    // Clear existing content
    d3.select(svgRef.current).selectAll('*').remove();

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 800; // Fixed height for consistency

    // Create the SVG container with zoom behavior
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create a group for the chart content
    const g = svg.append('g')
      .attr('transform', `translate(${containerWidth / 2},50)`);

    // Create the hierarchical structure
    const hierarchyData = d3.stratify<Employee>()
      .id(d => d.id)
      .parentId(d => d.manager_id)
      (employees);

    // Create the tree layout
    const treeLayout = d3.tree<Employee>()
      .nodeSize([200, 150]) // Increase spacing between nodes
      .separation((a, b) => a.parent === b.parent ? 1.2 : 2);

    const root = treeLayout(hierarchyData);

    // Normalize the tree layout
    let minX = Infinity;
    let maxX = -Infinity;
    root.each(d => {
      minX = Math.min(minX, d.x);
      maxX = Math.max(maxX, d.x);
    });
    const centerOffset = -minX - (maxX - minX) / 2;
    root.each(d => {
      d.x += centerOffset;
    });

    // Create links
    const links = g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', d3.linkVertical()
        .x(d => (d as any).x)
        .y(d => (d as any).y));

    // Create nodes
    const nodes = g.append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add node cards
    nodes.each(function(d: any) {
      const node = d3.select(this);
      const employee = d.data;

      const foreignObject = node.append('foreignObject')
        .attr('x', -90)
        .attr('y', -40)
        .attr('width', 180)
        .attr('height', 80);

      const card = foreignObject.append('xhtml:div')
        .attr('class', 'bg-white p-3 rounded-lg shadow-md border border-gray-200 text-center cursor-pointer hover:shadow-lg transition-shadow')
        .style('overflow', 'hidden');

      card.append('div')
        .attr('class', 'font-semibold text-gray-800 text-sm truncate')
        .text(employee.name);

      card.append('div')
        .attr('class', 'text-xs text-gray-600 truncate')
        .text(employee.title);

      card.append('div')
        .attr('class', 'text-xs text-gray-500 truncate mt-1')
        .text(employee.department);

      // Add click handler
      card.on('click', () => {
        setSelectedEmployee(employee);
        setIsDialogOpen(true);
        setIsAddMode(false);
        form.reset(employee);
      });
    });

    // Center the initial view
    const bounds = (svg.node() as SVGSVGElement).getBBox();
    const fullWidth = bounds.width;
    const fullHeight = bounds.height;
    const scale = Math.min(
      containerWidth / fullWidth,
      containerHeight / fullHeight
    ) * 0.9;

    const transform = d3.zoomIdentity
      .translate(
        containerWidth / 2 - (bounds.x + fullWidth / 2) * scale,
        containerHeight / 2 - (bounds.y + fullHeight / 2) * scale
      )
      .scale(scale);

    svg.call(zoom.transform, transform);
  };

  const handleSubmit = async (formData: Employee) => {
    try {
      if (!supabase) {
        toast({
          title: 'Error',
          description: 'Database connection not available',
          variant: 'destructive',
        });
        return;
      }

      if (isAddMode) {
        const { id, ...newEmployeeData } = formData;
        
        const { data: newEmployee, error } = await supabase
          .from('employees')
          .insert([newEmployeeData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Employee added successfully',
        });
      } else {
        const { error } = await supabase
          .from('employees')
          .update(formData)
          .eq('id', selectedEmployee?.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      }

      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to save employee data',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!supabase) {
        toast({
          title: 'Error',
          description: 'Database connection not available',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', selectedEmployee?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organization Chart</h1>
        <div className="space-x-2">
          <Button
            onClick={() => {
              setIsAddMode(true);
              setIsDialogOpen(true);
              form.reset({
                name: '',
                title: '',
                department: '',
                location: '',
                email: '',
                phone: '',
                bio: '',
                manager_id: null,
              });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          <Button variant="outline" onClick={fetchEmployees}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div 
            ref={containerRef} 
            className="relative w-full overflow-hidden bg-gray-50 rounded-lg"
            style={{ height: '800px' }}
          >
            <svg 
              ref={svgRef} 
              className="w-full h-full"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAddMode ? 'Add New Employee' : 'Edit Employee'}
            </DialogTitle>
            <DialogDescription>
              {isAddMode
                ? 'Add a new employee to the organization chart'
                : 'Edit employee information'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="bio">Bio</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <TabsContent value="details" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manager_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a manager" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {data.map((employee) => (
                              <SelectItem
                                key={employee.id}
                                value={employee.id}
                              >
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="bio" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write a brief bio..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <DialogFooter className="mt-6">
                  {!isAddMode && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  <Button type="submit">
                    {isAddMode ? (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Employee
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedEmployee?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedOrgChart;