import { Drawer, Form, Input, Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import ModalUploadDocument from './ModalUploadDocument';
import type { IDocument } from '../interfaces/project.interface';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface DrawerProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
}

const DrawerProjectForm: React.FC<DrawerProjectFormProps> = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const handleAddDocument = (document: IDocument) => {
    setDocuments([...documents, document]);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({ ...values, documents, status: 'Chưa kích hoạt', isActive: false });
      form.resetFields();
      setDocuments([]);
      onClose();
    });
  };

  const documentColumns = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày',
      dataIndex: 'day',
      key: 'day',
      render: (day: Date) => dayjs(day).format('DD/MM/YYYY'),
    },
    {
      title: 'Người gửi',
      dataIndex: 'sender',
      key: 'sender',
    },
    {
      title: 'Số tệp',
      dataIndex: 'files',
      key: 'files',
      render: (files: any[]) => files.length,
    },
  ];

  return (
    <Drawer
      title="Tạo yêu cầu dự án mới"
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Button onClick={onClose} style={{ marginRight: 8 }}>
          Hủy
        </Button>
      }
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label="Tên dự án"
          rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
        >
          <Input placeholder="Nhập tên dự án" />
        </Form.Item>
        <Form.Item
          name="alias"
          label="Mã dự án"
          rules={[{ required: true, message: 'Vui lòng nhập mã dự án!' }]}
        >
          <Input placeholder="Nhập mã dự án" />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <TextArea rows={4} placeholder="Nhập mô tả" />
        </Form.Item>
        <Form.Item label="Tài liệu">
          <Button icon={<PlusOutlined />} onClick={() => setOpenModal(true)}>
            Thêm tài liệu
          </Button>
          <Table
            rowKey={(record) => record.name}
            columns={documentColumns}
            dataSource={documents}
            pagination={false}
            style={{ marginTop: 16 }}
          />
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button onClick={handleSave} type="primary">
          Lưu
        </Button>
      </div>
      <ModalUploadDocument
        open={openModal}
        onClose={() => setOpenModal(false)}
        onUpload={handleAddDocument}
      />
    </Drawer>
  );
};

export default DrawerProjectForm;