import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Upload, X } from 'lucide-react';
import { useTags } from '../../hooks/useTags';
import type { EpisodeFormData } from '../../types/episode';

interface EpisodeFormProps {
  initialData?: Partial<EpisodeFormData>;
  onSubmit: (data: EpisodeFormData) => void;
  isSubmitting?: boolean;
}

const EpisodeForm = ({ initialData, onSubmit, isSubmitting = false }: EpisodeFormProps) => {
  // Format current datetime to ISO string and trim seconds/ms for datetime-local input
  const getCurrentDateTimeForInput = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EpisodeFormData>({
    defaultValues: {
      ...initialData,
      tags: initialData?.tags || [],
      // Set default publication date to current date and time if no initial data
      published_at: initialData?.published_at || getCurrentDateTimeForInput()
    },
  });
  
  const { tags: availableTags, createTag } = useTags();
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isExtractingDuration, setIsExtractingDuration] = useState(false);
  
  // Watch for file inputs to display filenames
  const audioFile = watch('audio_file');
  const imageFile = watch('image_file');
  
  // Extract audio duration from selected file
  const extractAudioDuration = async (file: File) => {
    setIsExtractingDuration(true);
    
    return new Promise<string>((resolve) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        
        // Format duration as HH:MM:SS
        const totalSeconds = Math.round(audio.duration);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const formattedDuration = [
          hours.toString().padStart(2, '0'),
          minutes.toString().padStart(2, '0'),
          seconds.toString().padStart(2, '0')
        ].join(':');
        
        setIsExtractingDuration(false);
        resolve(formattedDuration);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setIsExtractingDuration(false);
        resolve('00:00:00'); // Default if unable to extract
      };
    });
  };
  
  // Update filename displays when files are selected
  useEffect(() => {
    if (audioFile?.[0]) {
      setAudioFileName(audioFile[0].name);
      
      // Extract and set duration from audio file
      (async () => {
        try {
          const duration = await extractAudioDuration(audioFile[0]);
          setValue('duration', duration);
        } catch (error) {
          console.error('Error extracting audio duration:', error);
        }
      })();
    }
    
    if (imageFile?.[0]) {
      setImageFileName(imageFile[0].name);
    }
  }, [audioFile, imageFile, setValue]);

  const handleTagAdd = () => {
    if (!tagInput.trim()) return;
    
    // Check if tag already exists in selected tags
    if (!selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      setValue('tags', newTags);
    }
    
    setTagInput('');
  };

  const handleTagRemove = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setValue('tags', newTags);
    }
    setTagInput('');
  };

  const handleFormSubmit = (data: EpisodeFormData) => {
    // Ensure tags are included
    data.tags = selectedTags;
    
    // Include existing URLs if available
    if (initialData?.audio_url) {
      data.audio_url = initialData.audio_url;
    }
    
    if (initialData?.image_url) {
      data.image_url = initialData.image_url;
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Title
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Description
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Show Notes
            </label>
            <textarea
              {...register('show_notes')}
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Add
              </button>
            </div>
            
            {availableTags && availableTags.length > 0 && (
              <div className="mb-2">
                <p className="text-sm text-gray-400 mb-1">Existing tags:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagSelect(tag.name)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedTags.includes(tag.name)
                          ? 'bg-teal-400/20 text-teal-300'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedTags.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Selected tags:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 bg-teal-400/20 text-teal-300 rounded-full"
                    >
                      <span className="text-xs font-medium">{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="text-teal-300 hover:text-teal-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Audio File
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                {...register('audio_file')}
                accept="audio/mpeg,audio/mp3,audio/wav"
                className="hidden"
                id="audio-file"
              />
              <label
                htmlFor="audio-file"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Choose Audio File
              </label>
              {audioFileName && (
                <div className="flex items-center gap-2 text-sm text-teal-400">
                  <span>Selected: {audioFileName}</span>
                  {isExtractingDuration && (
                    <span className="text-yellow-300">Extracting duration...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setValue('audio_file', undefined);
                      setAudioFileName(null);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {initialData?.audio_url && !audioFileName && (
                <div className="text-sm text-teal-400">
                  Current audio file will be used
                </div>
              )}
              <div className="text-xs text-gray-400">
                Note: Audio duration will be automatically detected from the file.
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Cover Image
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                {...register('image_file')}
                accept="image/*"
                className="hidden"
                id="image-file"
              />
              <label
                htmlFor="image-file"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Choose Cover Image
              </label>
              {imageFileName && (
                <div className="flex items-center gap-2 text-sm text-teal-400">
                  <span>Selected: {imageFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('image_file', undefined);
                      setImageFileName(null);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {initialData?.image_url && !imageFileName && (
                <div className="text-sm text-teal-400">
                  Current image will be used
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Duration
            </label>
            <input
              {...register('duration', { required: 'Duration is required' })}
              placeholder="HH:MM:SS"
              className={`w-full px-4 py-2 bg-gray-800 border ${isExtractingDuration ? 'border-yellow-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-teal-500`}
              readOnly={isExtractingDuration}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
            )}
            {isExtractingDuration && (
              <p className="mt-1 text-sm text-yellow-400">Extracting duration from audio file...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Publication Date
            </label>
            <input
              type="datetime-local"
              {...register('published_at', { required: 'Publication date is required' })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
            {errors.published_at && (
              <p className="mt-1 text-sm text-red-500">{errors.published_at.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Default is set to today's date and current time
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isExtractingDuration}
          className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-teal-700 disabled:opacity-70"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? 'Saving...' : 'Save Episode'}
        </button>
      </div>
    </form>
  );
};

export default EpisodeForm;