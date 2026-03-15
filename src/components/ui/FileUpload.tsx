import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export interface FileUploadProps {
  value?: string;
  onChange: (fileUrl: string) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*,.svg',
  className = '',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Nieprawidłowy format pliku. Dozwolone są: JPG, PNG, GIF, WebP, SVG');
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Wystąpił błąd podczas przesyłania pliku');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      throw new Error('Nie udało się przesłać pliku');
    }
  };

  const handleFile = async (file: File) => {
    setError(null);

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);

    try {
      const fileUrl = await uploadFile(file);
      onChange(fileUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden
        disabled={isUploading}
      />
      
      {value ? (
        <Card variant="default" className="overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-3">
              {value.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <div className="relative">
                  <img
                    src={value}
                    alt="Podgląd"
                    className="w-full h-48 object-cover border border-[var(--coffee-cappuccino)]"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--coffee-espresso)] truncate">
                  {value.split('/').pop() || value}
                </span>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleRemove}
                >
                  Usuń
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          variant={isDragging ? 'elevated' : 'default'}
          className={`border-2 transition-colors cursor-pointer ${
            isDragging
              ? 'border-[var(--coffee-mocha)] bg-[var(--coffee-latte)]'
              : 'border-dashed border-[var(--coffee-cappuccino)] hover:border-[var(--coffee-macchiato)]'
          }`}
        >
          <CardContent className="p-8">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="text-center"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-[var(--coffee-charcoal)] font-medium mb-2">
                    {isUploading ? 'Przesyłanie pliku...' : 'Przeciągnij i upuść plik tutaj'}
                  </p>
                  <p className="text-sm text-[var(--coffee-espresso)] mb-4">
                    lub kliknij, aby wybrać plik
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Przesyłanie...' : 'Wybierz plik'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3">
          {error}
        </div>
      )}
    </div>
  );
}
