import { Drawer, Form, Input, Button, Table, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import ModalUploadDocument from './ModalUploadDocument';
import type { IDocument } from '../interfaces/project.interface';
import dayjs from 'dayjs';

// Hard code customer data
const customerOptions = [
  {
    value: '6837d4992e8694d80cc3a52f',
    label: 'Customer 1'
  }
];

// const { TextArea } = Input;
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
      const formattedValues = {
        ...values,
        documents,
        status: 'Chưa kích hoạt',
        isActive: false,
        day: values.day.format('YYYY-MM-DD'),
        documentIds: documents.map((doc: any) => doc._id).filter(Boolean)
      };
      onSave(formattedValues);
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
          name="pm"
          label="Quản lý dự án"
        >
          <Select
            disabled
            showSearch
            placeholder="Chọn PM"
            optionFilterProp="children"
            filterOption={(input, option) =>
              ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="customer"
          label="Khách hàng"
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
        >
          <Select
            showSearch
            placeholder="Chọn khách hàng"
            optionFilterProp="children"
            options={customerOptions}
            filterOption={(input, option) =>
              ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="day"
          label="Ngày bắt đầu"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
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