import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight, Database, Tag, Layers } from 'lucide-react';
import { FieldType, FieldValue, FieldHierarchy } from '../../types/admin';

export default function FieldManagement() {
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [fieldValues, setFieldValues] = useState<FieldValue[]>([]);
  const [hierarchies, setHierarchies] = useState<FieldHierarchy[]>([]);
  const [activeTab, setActiveTab] = useState<'types' | 'values' | 'hierarchy'>('types');
  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddingValue, setIsAddingValue] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const [newFieldType, setNewFieldType] = useState({
    name: '',
    description: '',
    display_order: 0,
    is_required: false
  });

  const [newFieldValue, setNewFieldValue] = useState({
    field_type_id: '',
    name: '',
    code: '',
    description: '',
    display_order: 0
  });

  // Mock data - replace with actual Supabase calls
  useEffect(() => {
    // Load field types, values, and hierarchies
    loadFieldData();
  }, []);

  const loadFieldData = async () => {
    // Mock data for demonstration
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
        description: 'Academic department or branch',
        display_order: 2,
        is_required: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Year',
        description: 'Academic year or semester',
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
      }
    ];

    setFieldTypes(mockFieldTypes);
    setFieldValues(mockFieldValues);
  };

  const handleAddFieldType = async () => {
    // Add field type logic
    const newType: FieldType = {
      id: Date.now().toString(),
      ...newFieldType,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setFieldTypes([...fieldTypes, newType]);
    setNewFieldType({ name: '', description: '', display_order: 0, is_required: false });
    setIsAddingType(false);
  };

  const handleAddFieldValue = async () => {
    // Add field value logic
    const newValue: FieldValue = {
      id: Date.now().toString(),
      ...newFieldValue,
      is_active: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setFieldValues([...fieldValues, newValue]);
    setNewFieldValue({ field_type_id: '', name: '', code: '', description: '', display_order: 0 });
    setIsAddingValue(false);
  };

  const toggleExpanded = (typeId: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeId)) {
      newExpanded.delete(typeId);
    } else {
      newExpanded.add(typeId);
    }
    setExpandedTypes(newExpanded);
  };

  const getValuesForType = (typeId: string) => {
    return fieldValues.filter(value => value.field_type_id === typeId);
  };

  const tabs = [
    { id: 'types', name: 'Field Types', icon: Database },
    { id: 'values', name: 'Field Values', icon: Tag },
    { id: 'hierarchy', name: 'Hierarchy', icon: Layers }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Field Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure dynamic fields for your academic structure</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Field Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Field Types</h2>
            <button
              onClick={() => setIsAddingType(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field Type</span>
            </button>
          </div>

          {/* Add Field Type Form */}
          {isAddingType && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Field Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newFieldType.name}
                    onChange={(e) => setNewFieldType({ ...newFieldType, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Program Type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newFieldType.display_order}
                    onChange={(e) => setNewFieldType({ ...newFieldType, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFieldType.description}
                    onChange={(e) => setNewFieldType({ ...newFieldType, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe this field type..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newFieldType.is_required}
                      onChange={(e) => setNewFieldType({ ...newFieldType, is_required: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Required field</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingType(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFieldType}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          {/* Field Types List */}
          <div className="space-y-4">
            {fieldTypes.map((type) => (
              <div key={type.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleExpanded(type.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {expandedTypes.has(type.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{type.name}</h3>
                        {type.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                        )}
                      </div>
                      {type.is_required && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs font-medium rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Values */}
                {expandedTypes.has(type.id) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Values</h4>
                      <button
                        onClick={() => {
                          setNewFieldValue({ ...newFieldValue, field_type_id: type.id });
                          setIsAddingValue(true);
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Add Value
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {getValuesForType(type.id).map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{value.name}</span>
                            {value.code && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({value.code})</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field Values Tab */}
      {activeTab === 'values' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Field Values</h2>
            <button
              onClick={() => setIsAddingValue(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field Value</span>
            </button>
          </div>

          {/* Add Field Value Form */}
          {isAddingValue && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Field Value</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field Type *
                  </label>
                  <select
                    value={newFieldValue.field_type_id}
                    onChange={(e) => setNewFieldValue({ ...newFieldValue, field_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Field Type</option>
                    {fieldTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newFieldValue.name}
                    onChange={(e) => setNewFieldValue({ ...newFieldValue, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Computer Science Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code
                  </label>
                  <input
                    type="text"
                    value={newFieldValue.code}
                    onChange={(e) => setNewFieldValue({ ...newFieldValue, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., CSE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newFieldValue.display_order}
                    onChange={(e) => setNewFieldValue({ ...newFieldValue, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFieldValue.description}
                    onChange={(e) => setNewFieldValue({ ...newFieldValue, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe this field value..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingValue(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFieldValue}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Field Hierarchy</h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Hierarchy management interface coming soon...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}