// components/fleet/AircraftForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Trash2, 
  Plus,
  Upload,
  X, 
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AircraftForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  aircraft = null, 
  capabilities = [], 
  equipment = [], 
  locations = [],
  onAddCapability,
  onAddEquipment,
  onAddLocation,
  mode = 'add' 
}) => {
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [selectedCapabilities, setSelectedCapabilities] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [newCapability, setNewCapability] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newInspectionType, setNewInspectionType] = useState('');
  const [newInspectionInterval, setNewInspectionInterval] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    registration: '',
    configuration: '',
    passengerCapacity: '',
    maxTakeoffWeight: '',
    maxCruiseSpeed: '',
    range: '',
    serviceCeiling: '',
    commonIssues: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { toast } = useToast();
  
  useEffect(() => {
    if (aircraft) {
      // Set basic info
      setFormData({
        type: aircraft.type || '',
        registration: Array.isArray(aircraft.registration) 
          ? aircraft.registration.join(', ') 
          : aircraft.registration || '',
        configuration: aircraft.configuration || '',
        passengerCapacity: aircraft.specifications?.passenger_capacity || '',
        maxTakeoffWeight: aircraft.specifications?.max_takeoff_weight || '',
        maxCruiseSpeed: aircraft.specifications?.max_cruise_speed || '',
        range: aircraft.specifications?.range || '',
        serviceCeiling: aircraft.specifications?.service_ceiling || '',
        commonIssues: Array.isArray(aircraft.maintenance?.common_issues) 
          ? aircraft.maintenance.common_issues.join('\n') 
          : aircraft.maintenance?.common_issues || ''
      });
      
      // Set maintenance
      if (aircraft.maintenance) {
        setInspections(aircraft.maintenance.inspections || []);
      }
      
      // Set selected capabilities, equipment, and locations
      setSelectedCapabilities(aircraft.capabilities || []);
      setSelectedEquipment(aircraft.special_equipment || []);
      setSelectedLocations(aircraft.base_locations || []);
      
      // Set image preview if available
      if (aircraft.imageUrl) {
        setImagePreview(aircraft.imageUrl);
      }
    } else {
      resetForm();
    }
  }, [aircraft, isOpen]);
  
  const resetForm = () => {
    setFormData({
      type: '',
      registration: '',
      configuration: '',
      passengerCapacity: '',
      maxTakeoffWeight: '',
      maxCruiseSpeed: '',
      range: '',
      serviceCeiling: '',
      commonIssues: ''
    });
    setSelectedCapabilities([]);
    setSelectedEquipment([]);
    setSelectedLocations([]);
    setInspections([]);
    setImagePreview(null);
    setImageFile(null);
    setActiveTab('basicInfo');
    setFormErrors({});
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.type.trim()) {
      errors.type = 'Aircraft type is required';
    }
    
    if (!formData.registration.trim()) {
      errors.registration = 'Registration number is required';
    }
    
    if (selectedCapabilities.length === 0) {
      errors.capabilities = 'At least one capability is required';
    }
    
    if (selectedLocations.length === 0) {
      errors.locations = 'At least one base location is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process registration numbers
      const registrationArray = formData.registration
        .split(',')
        .map(reg => reg.trim())
        .filter(reg => reg);
      
      const submissionData = {
        ...formData,
        registration: registrationArray,
        capabilities: selectedCapabilities,
        specialEquipment: selectedEquipment,
        baseLocations: selectedLocations,
        inspections: inspections,
        image: imageFile
      };
      
      console.log("Submitting data:", submissionData);
      
      await onSubmit(submissionData);
      
      // Success handling will be done in parent component
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message || "An error occurred while saving the aircraft data"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddCapability = () => {
    if (newCapability.trim()) {
      if (!capabilities.some(cap => cap.name === newCapability.trim())) {
        onAddCapability(newCapability.trim());
      }
      if (!selectedCapabilities.includes(newCapability.trim())) {
        setSelectedCapabilities(prev => [...prev, newCapability.trim()]);
        // Clear error if previously selected
        if (formErrors.capabilities) {
          setFormErrors({
            ...formErrors,
            capabilities: null
          });
        }
      }
      setNewCapability('');
    }
  };
  
  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      if (!equipment.some(eq => eq.name === newEquipment.trim())) {
        onAddEquipment(newEquipment.trim());
      }
      if (!selectedEquipment.includes(newEquipment.trim())) {
        setSelectedEquipment(prev => [...prev, newEquipment.trim()]);
      }
      setNewEquipment('');
    }
  };
  
  const handleAddLocation = () => {
    if (newLocation.trim()) {
      if (!locations.some(loc => loc.name === newLocation.trim())) {
        onAddLocation(newLocation.trim());
      }
      if (!selectedLocations.includes(newLocation.trim())) {
        setSelectedLocations(prev => [...prev, newLocation.trim()]);
        // Clear error if previously selected
        if (formErrors.locations) {
          setFormErrors({
            ...formErrors,
            locations: null
          });
        }
      }
      setNewLocation('');
    }
  };
  
  const handleAddInspection = () => {
    if (newInspectionType.trim() && newInspectionInterval.trim()) {
      setInspections(prev => [
        ...prev, 
        { 
          type: newInspectionType.trim(), 
          interval: newInspectionInterval.trim() 
        }
      ]);
      setNewInspectionType('');
      setNewInspectionInterval('');
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Both inspection type and interval are required"
      });
    }
  };
  
  const handleRemoveInspection = (index) => {
    setInspections(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleRemoveCapability = (capability) => {
    setSelectedCapabilities(prev => prev.filter(cap => cap !== capability));
  };
  
  const handleRemoveEquipment = (item) => {
    setSelectedEquipment(prev => prev.filter(eq => eq !== item));
  };
  
  const handleRemoveLocation = (location) => {
    setSelectedLocations(prev => prev.filter(loc => loc !== location));
  };
  
  const handleSelectCapability = (capability) => {
    if (!selectedCapabilities.includes(capability)) {
      setSelectedCapabilities(prev => [...prev, capability]);
      // Clear error if previously selected
      if (formErrors.capabilities) {
        setFormErrors({
          ...formErrors,
          capabilities: null
        });
      }
    }
  };
  
  const handleSelectEquipment = (item) => {
    if (!selectedEquipment.includes(item)) {
      setSelectedEquipment(prev => [...prev, item]);
    }
  };
  
  const handleSelectLocation = (location) => {
    if (!selectedLocations.includes(location)) {
      setSelectedLocations(prev => [...prev, location]);
      // Clear error if previously selected
      if (formErrors.locations) {
        setFormErrors({
          ...formErrors,
          locations: null
        });
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) onClose();
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Aircraft' : 'Edit Aircraft'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleFormSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basicInfo">Basic Info</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basicInfo" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type" className={formErrors.type ? "text-destructive" : ""}>
                    Aircraft Type
                  </Label>
                  <Input 
                    id="type" 
                    name="type"
                    placeholder="e.g., H125" 
                    value={formData.type}
                    onChange={handleInputChange}
                    className={formErrors.type ? 'border-destructive' : ''}
                  />
                  {formErrors.type && <p className="text-destructive text-sm mt-1">{formErrors.type}</p>}
                </div>
                
                <div>
                  <Label htmlFor="registration" className={formErrors.registration ? "text-destructive" : ""}>
                    Registration Numbers
                  </Label>
                  <Input 
                    id="registration" 
                    name="registration"
                    placeholder="e.g., XU-288 (separate multiple with commas)" 
                    value={formData.registration}
                    onChange={handleInputChange}
                    className={formErrors.registration ? 'border-destructive' : ''}
                  />
                  {formErrors.registration && <p className="text-destructive text-sm mt-1">{formErrors.registration}</p>}
                </div>
                
                <div>
                  <Label htmlFor="configuration">Configuration</Label>
                  <Textarea 
                    id="configuration" 
                    name="configuration"
                    placeholder="e.g., Single-engine helicopter designed for hot & high operations; seating for up to 5 passengers with a robust airframe" 
                    value={formData.configuration}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className={formErrors.capabilities ? "text-destructive" : ""}>
                    Capabilities
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCapabilities.map((capability, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {capability}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCapability(capability)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {formErrors.capabilities && <p className="text-destructive text-sm mb-2">{formErrors.capabilities}</p>}
                  
                  <div className="flex gap-2 items-center">
                    <Select onValueChange={handleSelectCapability}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select capability" />
                      </SelectTrigger>
                      <SelectContent>
                        {capabilities
                          .filter(cap => !selectedCapabilities.includes(cap.name))
                          .map(capability => (
                            <SelectItem key={capability.id} value={capability.name}>
                              {capability.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    
                    <span className="mx-2">or</span>
                    
                    <div className="flex-1 flex gap-2">
                      <Input 
                        placeholder="Add new capability" 
                        value={newCapability}
                        onChange={(e) => setNewCapability(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddCapability}
                        variant="outline"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className={formErrors.locations ? "text-destructive" : ""}>
                    Base Locations
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedLocations.map((location, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {location}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLocation(location)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {formErrors.locations && <p className="text-destructive text-sm mb-2">{formErrors.locations}</p>}
                  
                  <div className="flex gap-2 items-center">
                    <Select onValueChange={handleSelectLocation}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations
                          .filter(loc => !selectedLocations.includes(loc.name))
                          .map(location => (
                            <SelectItem key={location.id} value={location.name}>
                              {location.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    
                    <span className="mx-2">or</span>
                    
                    <div className="flex-1 flex gap-2">
                      <Input 
                        placeholder="Add new location" 
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddLocation}
                        variant="outline"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Special Equipment</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedEquipment.map((item, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {item}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveEquipment(item)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <Select onValueChange={handleSelectEquipment}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment
                          .filter(eq => !selectedEquipment.includes(eq.name))
                          .map(item => (
                            <SelectItem key={item.id} value={item.name}>
                              {item.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    
                    <span className="mx-2">or</span>
                    
                    <div className="flex-1 flex gap-2">
                      <Input 
                        placeholder="Add new equipment" 
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddEquipment}
                        variant="outline"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Aircraft Image</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video">
                        <img 
                          src={imagePreview} 
                          alt="Aircraft preview" 
                          className="w-full h-full object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload size={24} className="mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload aircraft image</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="passengerCapacity">Passenger Capacity</Label>
                  <Input 
                    id="passengerCapacity" 
                    name="passengerCapacity"
                    type="number"
                    placeholder="e.g., 5" 
                    value={formData.passengerCapacity}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxTakeoffWeight">Max Takeoff Weight</Label>
                  <Input 
                    id="maxTakeoffWeight" 
                    name="maxTakeoffWeight"
                    placeholder="e.g., 2,722 kg" 
                    value={formData.maxTakeoffWeight}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxCruiseSpeed">Max Cruise Speed</Label>
                  <Input 
                    id="maxCruiseSpeed" 
                    name="maxCruiseSpeed"
                    placeholder="e.g., 133 kts" 
                    value={formData.maxCruiseSpeed}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="range">Range</Label>
                  <Input 
                    id="range" 
                    name="range"
                    placeholder="e.g., 337 nm" 
                    value={formData.range}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="serviceCeiling">Service Ceiling</Label>
                  <Input 
                    id="serviceCeiling" 
                    name="serviceCeiling"
                    placeholder="e.g., 16,000 ft" 
                    value={formData.serviceCeiling}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Inspections</Label>
                  {inspections.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {inspections.map((inspection, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{inspection.type}</p>
                            <p className="text-sm text-muted-foreground">{inspection.interval}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveInspection(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1">
                      <Input 
                        placeholder="Inspection type (e.g., 100-Hour Inspection)" 
                        value={newInspectionType}
                        onChange={(e) => setNewInspectionType(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        placeholder="Interval (e.g., Every 100 flight hours)" 
                        value={newInspectionInterval}
                        onChange={(e) => setNewInspectionInterval(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleAddInspection}
                      variant="outline"
                    >
                      <Plus size={16} />
                      <span className="ml-2">Add</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="commonIssues">Common Issues</Label>
                  <Textarea 
                    id="commonIssues" 
                    name="commonIssues"
                    placeholder="List common issues (one per line)" 
                    value={formData.commonIssues}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                mode === 'add' ? 'Add Aircraft' : 'Update'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AircraftForm;