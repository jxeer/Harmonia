import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Upload, Download, Calendar, User, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicalRecordSchema } from "@shared/schema";
import { z } from "zod";
import type { UploadResult } from "@uppy/core";

const medicalRecordFormSchema = insertMedicalRecordSchema.extend({
  recordDate: z.string(),
}).omit({
  patientId: true,
});

type MedicalRecordFormData = z.infer<typeof medicalRecordFormSchema>;

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  recordType: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  recordDate: string;
  createdAt: string;
  provider?: {
    user: {
      firstName: string;
      lastName: string;
    };
    specialty: string;
  };
}

const recordTypes = [
  { value: "lab_result", label: "Lab Results" },
  { value: "prescription", label: "Prescription" },
  { value: "imaging", label: "Imaging/X-Ray" },
  { value: "consultation_note", label: "Consultation Notes" },
  { value: "other", label: "Other" },
];

export default function MedicalRecords() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["/api/medical-records"],
    enabled: !!user,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      recordDate: new Date().toISOString().split('T')[0],
      recordType: "other",
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormData) => {
      const recordData = {
        ...data,
        recordDate: new Date(data.recordDate + "T12:00:00Z"),
      };
      await apiRequest("POST", "/api/medical-records", recordData);
    },
    onSuccess: () => {
      toast({
        title: "Record Added",
        description: "Your medical record has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      setUploadDialogOpen(false);
      reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add medical record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const fileURL = uploadedFile.uploadURL;
      
      // Set ACL policy for the uploaded file
      try {
        const aclResponse = await apiRequest("PUT", "/api/medical-record-files", {
          fileURL,
        });
        const aclData = await aclResponse.json();
        
        // Update form with file information
        setValue("fileUrl", aclData.objectPath);
        setValue("fileName", uploadedFile.name);
        setValue("fileSize", uploadedFile.size);
        
        toast({
          title: "File Uploaded",
          description: "Your file has been uploaded successfully. Complete the form to save the record.",
        });
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to process uploaded file. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = (data: MedicalRecordFormData) => {
    createRecordMutation.mutate(data);
  };

  const filteredRecords = records.filter((record: MedicalRecord) => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.provider?.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.provider?.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "" || record.recordType === filterType;
    
    return matchesSearch && matchesType;
  });

  const getRecordTypeLabel = (type: string) => {
    return recordTypes.find(rt => rt.value === type)?.label || type;
  };

  const getRecordTypeColor = (type: string) => {
    const colors = {
      lab_result: "bg-vitality/10 text-vitality",
      prescription: "bg-golden/10 text-golden-dark",
      imaging: "bg-warm-orange/10 text-warm-orange",
      consultation_note: "bg-accent-yellow/10 text-accent-yellow",
      other: "bg-cream text-warm-brown",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-golden-dark mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Medical Records
            </h1>
            <p className="text-xl text-warm-brown">
              Securely store and access your healthcare documents.
            </p>
          </div>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-golden hover:bg-golden-dark text-white mt-4 md:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-golden-dark">Add Medical Record</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-warm-brown font-medium">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    className="border-cream focus:ring-golden focus:border-golden"
                    placeholder="e.g., Blood Test Results - March 2024"
                  />
                  {errors.title && (
                    <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recordType" className="text-warm-brown font-medium">Record Type *</Label>
                  <Select onValueChange={(value) => setValue("recordType", value)}>
                    <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recordType && (
                    <p className="text-destructive text-sm mt-1">{errors.recordType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recordDate" className="text-warm-brown font-medium">Record Date *</Label>
                  <Input
                    id="recordDate"
                    type="date"
                    {...register("recordDate")}
                    className="border-cream focus:ring-golden focus:border-golden"
                  />
                  {errors.recordDate && (
                    <p className="text-destructive text-sm mt-1">{errors.recordDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-warm-brown font-medium">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    className="border-cream focus:ring-golden focus:border-golden"
                    placeholder="Additional notes about this record..."
                  />
                </div>

                <div>
                  <Label className="text-warm-brown font-medium mb-2 block">Upload File</Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={50 * 1024 * 1024} // 50MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full bg-cream hover:bg-cream/80 text-warm-brown border border-cream"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Choose File</span>
                    </div>
                  </ObjectUploader>
                  {watch("fileName") && (
                    <p className="text-sm text-vitality mt-2">
                      ✓ {watch("fileName")} ({formatFileSize(watch("fileSize"))})
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    className="border-cream text-warm-brown hover:bg-cream"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createRecordMutation.isPending}
                    className="bg-golden hover:bg-golden-dark text-white"
                  >
                    {createRecordMutation.isPending ? "Adding..." : "Add Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white rounded-3xl shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown/50 w-4 h-4" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-cream focus:ring-golden focus:border-golden"
                />
              </div>
              <Select onValueChange={setFilterType} value={filterType}>
                <SelectTrigger className="w-full md:w-48 border-cream focus:ring-golden focus:border-golden">
                  <SelectValue placeholder="All Record Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Record Types</SelectItem>
                  {recordTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-6">
          {isLoading ? (
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto mb-4"></div>
                  <p className="text-warm-brown">Loading medical records...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredRecords.length === 0 ? (
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardContent className="text-center py-20">
                <FileText className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-golden-dark mb-4">
                  {records.length === 0 ? "No Medical Records" : "No Records Found"}
                </h3>
                <p className="text-warm-brown mb-6 max-w-md mx-auto">
                  {records.length === 0 
                    ? "Start building your medical history by adding your first record."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {records.length === 0 && (
                  <Button 
                    onClick={() => setUploadDialogOpen(true)}
                    className="bg-golden hover:bg-golden-dark text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record: MedicalRecord) => (
              <Card key={record.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-golden-dark">{record.title}</h3>
                        <Badge className={`${getRecordTypeColor(record.recordType)} border-0 ml-4`}>
                          {getRecordTypeLabel(record.recordType)}
                        </Badge>
                      </div>
                      
                      {record.description && (
                        <p className="text-warm-brown mb-3">{record.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-warm-brown/70">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(record.recordDate), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        {record.provider && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                              Dr. {record.provider.user.firstName} {record.provider.user.lastName}
                              {record.provider.specialty && ` - ${record.provider.specialty}`}
                            </span>
                          </div>
                        )}
                        
                        {record.fileName && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{record.fileName} ({formatFileSize(record.fileSize)})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {record.fileUrl && (
                      <div className="mt-4 md:mt-0 md:ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(record.fileUrl, '_blank')}
                          className="border-golden text-golden hover:bg-golden hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-warm-brown/50">
                    Added {format(new Date(record.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* HIPAA Compliance Notice */}
        <Card className="bg-sunset-gradient/10 rounded-3xl shadow-lg border-0 mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-golden-dark mb-4">Your Privacy is Protected</h3>
            <p className="text-warm-brown max-w-2xl mx-auto">
              All medical records are encrypted and stored securely with HIPAA-compliant protocols. 
              Only you and authorized healthcare providers can access your documents. Your cultural 
              and personal health information is treated with the utmost respect and confidentiality.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
