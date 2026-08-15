import { css, cx } from "../../system.ts";

import {
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { Icon } from "./icon.tsx";

/** Props for {@link FileUpload}. */
export interface FileUploadProps {
  /** Callback fired when the user selects or drops files; receives an array of File objects. */
  onFiles: (files: File[]) => void;
  /** MIME type or file extension filter (e.g., `"image/*"`, `".pdf,.docx"`). */
  accept?: string;
  /** If true, multiple files can be selected at once. If false, only one file at a time. Defaults to false. */
  multiple?: boolean;
  /** If true, the upload zone is disabled and cannot accept files. Defaults to false. */
  disabled?: boolean;
  /** Extra CSS class names to apply to the root container. */
  className?: string;
}

/**
 * Drag-and-drop file upload zone with file list and remove buttons.
 *
 * Displays a large drop zone with cloud upload icon. Supports drag-and-drop or click-to-browse.
 * Shows uploaded files below the zone with file names, sizes, and remove buttons.
 * Maintains a list of selected files and invokes callback on each change.
 *
 * @example
 * ```tsx
 * <FileUpload onFiles={setFiles} accept="image/*" multiple />
 * ```
 */
export function FileUpload({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  className,
}: FileUploadProps): ReactNode {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const arr = Array.from(fileList);
      const next = multiple ? [...files, ...arr] : arr;
      setFiles(next);
      onFiles(next);
    },
    [onFiles, files, multiple],
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index);
      setFiles(next);
      onFiles(next);
      if (inputRef.current) inputRef.current.value = "";
    },
    [files, onFiles],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  return (
    <>
      <div
        className={cx(
          zone,
          dragOver ? zoneActive : undefined,
          disabled ? disabledStyle : undefined,
          className,
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
        aria-label="Upload files"
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className={hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Icon name="cloud_upload" size={32} className={icon} />
        <p className={text}>
          Drag files here or click to browse
        </p>
      </div>
      {files.length > 0 && (
        <div className={fileListStyle}>
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className={fileRow}>
              <Icon name="description" size={16} className={fileIcon} />
              <span className={fileName}>{f.name}</span>
              <span className={fileSize}>{formatSize(f.size)}</span>
              <button
                type="button"
                className={removeBtn}
                onClick={() => removeFile(i)}
                aria-label={`Remove ${f.name}`}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Helper function to format file sizes (not exported or documented separately)
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const zone = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "3",
  padding: "8",
  backgroundColor: "bg.page",
  border: "2px dashed",
  borderColor: "border.default",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: {
    borderColor: "sunbeam.orange",
  },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const zoneActive = css({
  borderColor: "sunbeam.orange",
  backgroundColor: "sunshine.300/10",
});

const disabledStyle = css({
  opacity: 0.5,
  cursor: "not-allowed",
});

const hiddenInput = css({
  position: "absolute",
  width: "0.25",
  height: "0.25",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
});

const icon = css({
  color: "sunbeam.orange",
});

const text = css({
  fontSize: "sm",
  fontFamily: "body",
  color: "text.secondary",
  margin: 0,
});

const fileListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0",
  marginTop: "2",
  border: "1px solid",
  borderColor: "border.default",
});

const fileRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  paddingBlock: "2",
  paddingInline: "3",
  borderBottom: "1px solid",
  borderColor: "border.subtle",
  "&:last-child": {
    borderBottom: "none",
  },
});

const fileIcon = css({
  color: "text.muted",
  flexShrink: 0,
});

const fileName = css({
  flex: 1,
  fontSize: "13",
  fontFamily: "mono",
  color: "text.primary",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const fileSize = css({
  fontSize: "xs",
  fontFamily: "mono",
  color: "text.muted",
  flexShrink: 0,
});

const removeBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "6",
  height: "6",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "text.muted",
  flexShrink: 0,
  transition: "color 0.15s ease",
  _hover: {
    color: "sunbeam.orange",
  },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});
