"use client";
import { Button, ModalBody, ModalHeader } from "@nextui-org/react";
import { useState } from "react";
import { FileIcon } from "@radix-ui/react-icons";
import { FilePreviewer } from "./filePreviewer";

type NewFilesFormProps = {
  onSubmit: (e?: any, values?: any) => {};
  onClose?: () => {};
  isPending: boolean;
};

export const NewFilesForm = ({
  onSubmit,
  isPending,
  onClose,
}: NewFilesFormProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const _files = Array.from(e.target.files);
      setFiles([...files, ..._files]);
    }
  };

  const onDeleteSelected = (index: number) => {
    const _files = Array.from(files);
    _files.splice(index, 1);
    setFiles(_files);
  };

  return (
    <form
      onSubmit={(e) => {
        onSubmit(e, files);
      }}
      className="gap-4 grid grid-cols-1"
    >
      <div className="flex justify-between items-center">
        <label
          htmlFor="uploadfiles"
          className="bg-default-100 text-foreground-500 text-sm  hover:opacity-80 w-full h-12   hover:cursor-pointer hover:bg-default-200 rounded-xl px-3 py-3 flex item-center justify-start"
        >
          <>
            <FileIcon className="w-5 h-5 my-auto me-2" />
            {files.length > 0
              ? `(${files.length}) Add more... `
              : "Add files..."}
          </>
        </label>
        <input
          id="uploadfiles"
          type="file"
          multiple
          accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
          required
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>
      {files.map((item, index) => {
        item.upload = true; // To assign the image
        item.index = index; //To delete from the uploading list
        return (
          <FilePreviewer item={item} key={index} onDelete={onDeleteSelected} />
        );
      })}
      <Button
        size="md"
        color="primary"
        type="submit"
        isLoading={isPending}
        onPress={onClose}
        isDisabled={files.length > 0 ? false : true}
      >
        Upload{" "}
        {files.length > 0 &&
          `${files.length} file${files.length > 1 ? "s" : ""}`}
      </Button>
    </form>
  );
};
