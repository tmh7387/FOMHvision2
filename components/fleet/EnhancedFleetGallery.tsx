'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import AircraftForm from './AircraftForm';
import AircraftDetails from './AircraftDetails';

const DEMO_AIRCRAFT = [
  {
    id: 1,
    type: 'EC120B',
    registration: ['XU-168'],
    configuration: 'Executive configuration with 5 passenger seats and premium leather interior.',
    capabilities: ['Scenic/charter flights', 'Medevac', 'Light utility operations'],
    base_locations: ['Phnom Penh International Airport'],
    special_equipment: ['Standard configuration'],
    imageUrl: '/api/placeholder/400/320',
    specifications: {
      passenger_capacity: 4,
      max_takeoff_weight: '1,715 kg',
      max_cruise_speed: '220 km/h',
      range: '710 km',
      service_ceiling: '5,182 m',
    },
    maintenance: {
      inspections: [
        { type: '100-Hour Inspection', interval: 'Every 100 flight hours' },
        { type: 'Annual Inspection', interval: 'Every 12 months' }
      ],
      common_issues: [
        'Tail rotor drive shaft bearing wear',
        'Main transmission chip detector false indications'
      ]
    },
    status: 'Deregistered for return to Australia'
  }
];

const EnhancedFleetGallery = () => {
  const [aircraft, setAircraft] = useState([]);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [capabilities, setCapabilities] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [locations, setLocations] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAircraftData();
    fetchReferenceData();
  }, []);

  const fetchAircraftData = async () => {
    setLoading(true);
    try {
      // Fetch aircraft data from Supabase
      const { data, error } = await supabase
        .from('aircraft')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Retrieved aircraft data:", data);
        
        // Set image URLs directly from the database
        const aircraftWithImages = data.map(aircraft => ({
          ...aircraft,
          imageUrl: aircraft.image_url || '/api/placeholder/400/320'
        }));
        
        setAircraft(aircraftWithImages);
      } else {
        console.log("No aircraft data found, using demo data");
        // Use demo data for prototype or when no data exists
        setAircraft(DEMO_AIRCRAFT);
      }
    } catch (error) {
      console.error("Error fetching aircraft data:", error);
      toast({
        variant: "destructive",
        title: "Error fetching aircraft data",
        description: error.message || "Unknown error occurred",
      });
      
      // Use demo data for prototype
      setAircraft(DEMO_AIRCRAFT);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const { data: capData, error: capError } = await supabase
        .from('dropdown_options')
        .select('*')
        .eq('category', 'capability');
      
      const { data: eqData, error: eqError } = await supabase
        .from('dropdown_options')
        .select('*')
        .eq('category', 'equipment');
      
      const { data: locData, error: locError } = await supabase
        .from('dropdown_options')
        .select('*')
        .eq('category', 'location');
      
      if (capError || eqError || locError) {
        throw new Error(capError?.message || eqError?.message || locError?.message);
      }
      
      setCapabilities(capData || []);
      setEquipment(eqData || []);
      setLocations(locData || []);
    } catch (error) {
      console.error("Error fetching reference data:", error);
      toast({
        variant: "destructive",
        title: "Error fetching reference data",
        description: error.message || "Unknown error occurred",
      });
    }
  };

  const handleAddAircraft = async (formData) => {
    try {
      console.log("Adding new aircraft with data:", formData);
      
      let imageUrl = null;
      
      // If an image was uploaded, store it in Supabase Storage
      if (formData.image && formData.image instanceof File) {
        console.log("Uploading image:", formData.image.name);
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('aircraft-images')
          .upload(fileName, formData.image);
        
        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }
        
        // Get the public URL for this image
        const { data: urlData } = await supabase.storage
          .from('aircraft-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData?.publicUrl || null;
        console.log("Image uploaded successfully. URL:", imageUrl);
      }
      
      // Create the aircraft record in Supabase
      const { data, error } = await supabase
        .from('aircraft')
        .insert([
          {
            type: formData.type,
            registration: formData.registration,
            configuration: formData.configuration,
            capabilities: formData.capabilities,
            base_location: formData.baseLocations, // Using singular name to match DB
            special_equipment: formData.specialEquipment,
            image_url: imageUrl, // Changed from image_path to image_url to match DB schema
            specifications: {
              passenger_capacity: formData.passengerCapacity,
              max_takeoff_weight: formData.maxTakeoffWeight,
              max_cruise_speed: formData.maxCruiseSpeed,
              range: formData.range,
              service_ceiling: formData.serviceCeiling
            },
            maintenance: {
              inspections: formData.inspections || [],
              common_issues: formData.commonIssues ? formData.commonIssues.split('\n').filter(i => i.trim()) : []
            }
          }
        ])
        .select();
      
      if (error) {
        console.error("Database insert error:", error);
        throw error;
      }
      
      console.log("Aircraft added successfully:", data);
      
      toast({
        title: "Aircraft added",
        description: `${formData.type} has been added to the fleet.`,
      });
      
      setIsAddDialogOpen(false);
      fetchAircraftData(); // Refresh the aircraft list
      
      return data;
      
    } catch (error) {
      console.error("Error in handleAddAircraft:", error);
      toast({
        variant: "destructive",
        title: "Error adding aircraft",
        description: error.message || "Unknown error occurred",
      });
      throw error; // Re-throw to let the form component handle it
    }
  };

  const handleEditAircraft = async (formData) => {
    try {
      console.log("Editing aircraft with data:", formData);
      console.log("Selected aircraft:", selectedAircraft);
      
      let imageUrl = selectedAircraft.image_url;
      let fileName = null;
      
      // Extract the filename from the current image URL if it exists
      if (imageUrl) {
        const urlParts = imageUrl.split('/');
        fileName = urlParts[urlParts.length - 1];
      }
      
      // If a new image was uploaded, update it in Supabase Storage
      if (formData.image && formData.image instanceof File) {
        // Delete the old image if it exists and we have the filename
        if (fileName) {
          console.log("Deleting old image:", fileName);
          await supabase.storage
            .from('aircraft-images')
            .remove([fileName]);
        }
        
        // Upload the new image
        console.log("Uploading new image");
        const fileExt = formData.image.name.split('.').pop();
        fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('aircraft-images')
          .upload(fileName, formData.image);
        
        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }
        
        // Get the public URL for this image
        const { data: urlData } = await supabase.storage
          .from('aircraft-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData?.publicUrl || null;
        console.log("New image uploaded successfully. URL:", imageUrl);
      }
      
      // Update the aircraft record in Supabase
      const { data, error } = await supabase
        .from('aircraft')
        .update({
          type: formData.type,
          registration: formData.registration,
          configuration: formData.configuration,
          capabilities: formData.capabilities,
          base_location: formData.baseLocations, // Using singular name to match DB
          special_equipment: formData.specialEquipment,
          image_url: imageUrl, // Changed from image_path to image_url to match DB schema
          specifications: {
            passenger_capacity: formData.passengerCapacity,
            max_takeoff_weight: formData.maxTakeoffWeight,
            max_cruise_speed: formData.maxCruiseSpeed,
            range: formData.range,
            service_ceiling: formData.serviceCeiling
          },
          maintenance: {
            inspections: formData.inspections || [],
            common_issues: formData.commonIssues ? formData.commonIssues.split('\n').filter(i => i.trim()) : []
          }
        })
        .eq('id', selectedAircraft.id)
        .select();
      
      if (error) {
        console.error("Database update error:", error);
        throw error;
      }
      
      console.log("Aircraft updated successfully:", data);
      
      toast({
        title: "Aircraft updated",
        description: `${formData.type} has been updated.`,
      });
      
      setIsEditDialogOpen(false);
      fetchAircraftData(); // Refresh the aircraft list
      
      return data;
      
    } catch (error) {
      console.error("Error in handleEditAircraft:", error);
      toast({
        variant: "destructive",
        title: "Error updating aircraft",
        description: error.message || "Unknown error occurred",
      });
      throw error; // Re-throw to let the form component handle it
    }
  };

  const handleDeleteAircraft = async (aircraftId) => {
    try {
      // Find the aircraft to get its image path
      const aircraftToDelete = aircraft.find(a => a.id === aircraftId);
      
      // Delete the image from storage if it exists
      if (aircraftToDelete?.image_url) {
        const urlParts = aircraftToDelete.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('aircraft-images')
          .remove([fileName]);
      }
      
      // Delete the aircraft record
      const { error } = await supabase
        .from('aircraft')
        .delete()
        .eq('id', aircraftId);
      
      if (error) throw error;
      
      toast({
        title: "Aircraft deleted",
        description: "The aircraft has been removed from the fleet.",
      });
      
      // If the deleted aircraft was selected, clear the selection
      if (selectedAircraft?.id === aircraftId) {
        setSelectedAircraft(null);
        setIsDetailsOpen(false);
      }
      
      fetchAircraftData(); // Refresh the aircraft list
      
    } catch (error) {
      console.error("Error deleting aircraft:", error);
      toast({
        variant: "destructive",
        title: "Error deleting aircraft",
        description: error.message || "Unknown error occurred",
      });
    }
  };

  const handleAddReferenceItem = async (type, value) => {
    try {
      const { data, error } = await supabase
        .from('dropdown_options')
        .insert([{ category: type, value: value }])
        .select();
      
      if (error) throw error;
      
      // Update the local state based on the type
      switch (type) {
        case 'capability':
          setCapabilities(prev => [...prev, data[0]]);
          break;
        case 'equipment':
          setEquipment(prev => [...prev, data[0]]);
          break;
        case 'location':
          setLocations(prev => [...prev, data[0]]);
          break;
      }
      
      toast({
        title: "Success",
        description: `New ${type} has been added.`,
      });
      
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      toast({
        variant: "destructive",
        title: `Error adding ${type}`,
        description: error.message || "Unknown error occurred",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading fleet data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Fleet Information</h2>
        <Button 
          variant="default" 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Aircraft
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aircraft.map((aircraft) => (
          <Card 
            key={aircraft.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedAircraft(aircraft);
              setIsDetailsOpen(true);
            }}
          >
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{aircraft.type}</h3>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAircraft(aircraft);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAircraft(aircraft.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="aspect-video overflow-hidden">
                <img
                  src={aircraft.imageUrl}
                  alt={aircraft.type}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 pt-2">
                <div className="flex flex-wrap gap-2 mt-2">
                  {aircraft.capabilities?.slice(0, 3).map((capability, index) => (
                    <Badge key={index} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                  {aircraft.capabilities?.length > 3 && (
                    <Badge variant="outline">
                      +{aircraft.capabilities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Aircraft Dialog */}
      <AircraftForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAircraft}
        capabilities={capabilities}
        equipment={equipment}
        locations={locations}
        onAddCapability={(value) => handleAddReferenceItem('capability', value)}
        onAddEquipment={(value) => handleAddReferenceItem('equipment', value)}
        onAddLocation={(value) => handleAddReferenceItem('location', value)}
        mode="add"
      />

      {/* Edit Aircraft Dialog */}
      {selectedAircraft && (
        <AircraftForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleEditAircraft}
          aircraft={selectedAircraft}
          capabilities={capabilities}
          equipment={equipment}
          locations={locations}
          onAddCapability={(value) => handleAddReferenceItem('capability', value)}
          onAddEquipment={(value) => handleAddReferenceItem('equipment', value)}
          onAddLocation={(value) => handleAddReferenceItem('location', value)}
          mode="edit"
        />
      )}

      {/* Aircraft Details Dialog */}
      {selectedAircraft && (
        <AircraftDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          aircraft={selectedAircraft}
          onEdit={() => {
            setIsDetailsOpen(false);
            setIsEditDialogOpen(true);
          }}
          onDelete={() => {
            handleDeleteAircraft(selectedAircraft.id);
            setIsDetailsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedFleetGallery;