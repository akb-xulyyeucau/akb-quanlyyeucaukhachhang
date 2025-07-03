import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { IDocument } from '../interfaces/project.interface';
import dayjs from 'dayjs';
import { updateDocument } from '../services/document.service';
import { useTranslation } from 'react-i18next'; // Thêm import useTranslation

interface ModalEditDocumentProps {
  open: boolean;
  onClose: () => void;
  document: IDocument | null;
  onSuccess: () => void;
}

interface ExtendedUploadFile extends UploadFile {
  path?: string;
}

const ModalEditDocument: React.FC<ModalEditDocumentProps> = ({
  open,
  onClose,
  document,
  onSuccess
}) => {
  const { t } = useTranslation('projectDetail');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<ExtendedUploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset form khi document thay đổi
  useEffect(() => {
    if (document) {
      form.setFieldsValue({
        name: document.name,
        day: document.day ? dayjs(document.day) : undefined,
      });

      // Khởi tạo fileList từ document.files
      if (document.files) {
        const initialFiles: ExtendedUploadFile[] = document.files.map(file => ({
          uid: file._id || '-1',
          name: file.originalName,
          status: 'done' as const,
          url: `/document/download/${file.path}`,
          path: file.path,
          type: file.type,
          size: file.size
        }));
        setFileList(initialFiles);
      }
    }
  }, [document, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('day', values.day.toISOString());

      // Xử lý files
      // 1. Lọc ra các file cũ còn được giữ lại (chưa bị xóa)
      const remainingOldFiles = fileList
        .filter(file => !file.originFileObj && file.path) // Lọc ra các file cũ
        .map(file => ({
          originalName: file.name,
          path: file.path,
          size: file.size,
          type: file.type
        }));

      // 2. Thêm thông tin file cũ vào formData
      formData.append('existingFiles', JSON.stringify(remainingOldFiles));

      // 3. Thêm các file mới
      const newFiles = fileList.filter(file => file.originFileObj);
      newFiles.forEach(file => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });

      // 4. Thêm sender ID
      if (document?.sender?._id) {
        formData.append('sender', document.sender._id);
      }

      // Gọi API update
      if (document?._id) {
        await updateDocument(document._id, formData);
        message.success(t('ModalEditDocument.updateSuccess'));
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      message.error(error.message || t('ModalEditDocument.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeUpload = (file: File) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(t('ModalEditDocument.fileSizeError'));
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  return (
    <Modal
      title={t('ModalEditDocument.modalTitle')}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('ModalEditDocument.closeButton')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {t('ModalEditDocument.editButton')}
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label={t('ModalEditDocument.documentNameLabel')}
          rules={[{ required: true, message: t('ModalEditDocument.documentNameRequired') }]}
        >
          <Input placeholder={t('ModalEditDocument.documentNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="day"
          label={t('ModalEditDocument.dateLabel')}
          rules={[{ required: true, message: t('ModalEditDocument.dateRequired') }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item label={t('ModalEditDocument.attachmentsLabel')}>
          <Upload
            beforeUpload={handleBeforeUpload}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList as ExtendedUploadFile[])}
            multiple
            onRemove={(file) => {
              // Xác nhận trước khi xóa file
              if (!file.originFileObj) { // Nếu là file cũ
                Modal.confirm({
                  title: t('ModalEditDocument.confirmDeleteTitle'),
                  content: t('ModalEditDocument.confirmDeleteContent', { fileName: file.name }),
                  onOk() {
                    setFileList(prev => prev.filter(f => f.uid !== file.uid));
                  }
                });
                return false; // Ngăn xóa ngay lập tức
              }
              return true; // Cho phép xóa file mới ngay lập tức
            }}
          >
            <Button icon={<UploadOutlined />}>{t('ModalEditDocument.selectFileButton')}</Button>
          </Upload>
        </Form.Item>

        <Form.Item label={t('ModalEditDocument.senderInfoLabel')}>
          <Input
            value={document?.sender?.email}
            disabled
            addonBefore="Email" // Giữ nguyên vì đây là label cố định cho addonBefore
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalEditDocument;