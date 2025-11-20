import React, { useState, useEffect } from 'react';
import { Upload, FileText, Tag, Calendar, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { FieldType, FieldValue, Subject, DynamicFieldForm } from '../../types/admin';

export default function DynamicUploadForm() {
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [fieldValues, setFieldValues] = useState<FieldValue[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState<DynamicFieldForm>({
    selectedFields: {},
    title: '',
    year: new Date().getFullYear(),
    tags: [],
    difficulty_level: undefined
  });
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    // Mock data - replace with actual Supabase calls
    const mockFieldTypes: FieldType[] = [
      {
        id: '1',
        name: 'Program Type',
        description: 'Academic program level',
        display_order: 1,
        is_required: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Branch',
        description: 'Academic department',
        display_order: 2,
        is_required: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Year',
        description: 'Academic year',
        display_order: 3,
        is_required: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const mockFieldValues: FieldValue[] = [
      {
        id: '1',
        field_type_id: '1',
        name: 'Bachelor of Technology',
        code: 'B.Tech',
        description: '',
        display_order: 1,
        is_active: true,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        field_type_id: '2',
        name: 'Computer Science Engineering',
        code: 'CSE',
        description: '',
        display_order: 1,
        is_active: true,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        field_type_id: '3',
        name: '3rd Year',
        code: '3',
        description: '',
        display_order: 3,
        is_active: true,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const mockSubjects: Subject[] = [
      {
        id: '1',
        name: 'Data Structures and Algorithms',
        code: 'CS301',
        description: 'Fundamental data structures and algorithms',
        credits: 4,
        is_active: true,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setFieldTypes(mockFieldTypes);
    setFieldValues(mockFieldValues);
    setSubjects(mockSubjects);
  };

  const getValuesForFieldType = (fieldTypeId: string) => {
    return fieldValues.filter(value => value.field_type_id === fieldTypeId);
  };

  const handleFieldChange = (fieldTypeId: string, valueId: string) => {
    setForm(prev => ({
      ...prev,
      selectedFields: {
        ...prev.selectedFields,
        [fieldTypeId]: valueId
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Please select a PDF file only.' });
        return;
      }
      setForm(prev => ({ ...prev, file }));
      setMessage(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setForm(prev => ({ ...prev, file }));
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Please select a PDF file only.' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = fieldTypes.filter(type => type.is_required);
    const missingFields = requiredFields.filter(type => !form.selectedFields[type.id]);
    
    if (missingFields.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Please select values for: ${missingFields.map(f => f.name).join(', ')}` 
      });
      return;
    }

    if (!form.file) {
      setMessage({ type: 'error', text: 'Please select a PDF file to upload.' });
      return;
    }

    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title for the paper.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      // Upload logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      
      setMessage({ type: 'success', text: 'Paper uploaded successfully!' });
      
      // Reset form
      setForm({
        selectedFields: {},
        title: '',
        year: new Date().getFullYear(),
        tags: [],
        difficulty_level: undefined,
        file: undefined
      });
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !form.tags.includes(tag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload PYQ Paper</h1>
        <p className="text-gray-600 dark:text-gray-400">Add a new Previous Year Question paper to the repository</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center space-x-3 p-4 rounded-lg animate-fade-in ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dynamic Fields */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Academic Classification</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fieldTypes
              .sort((a, b) => a.display_order - b.display_order)
              .map((fieldType) => (
                <div key={fieldType.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {fieldType.name}
                    {fieldType.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    value={form.selectedFields[fieldType.id] || ''}
                    onChange={(e) => handleFieldChange(fieldType.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    required={fieldType.is_required}
                  >
                    <option value="">Select {fieldType.name}</option>
                    {getValuesForFieldType(fieldType.id).map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.name} {value.code && `(${value.code})`}
                      </option>
                    ))}
                  </select>
                  {fieldType.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{fieldType.description}</p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Paper Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Paper Details</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paper Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Data Structures Mid-Term Exam 2024"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={form.subject_id || ''}
                onChange={(e) => setForm(prev => ({ ...prev, subject_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Subject (Optional)</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code && `(${subject.code})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year *
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                min="2000"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={form.difficulty_level || ''}
                onChange={(e) => setForm(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add tags (press Enter)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload File</span>
          </h2>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              
              {form.file ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Selected: {form.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(form.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Paper</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}