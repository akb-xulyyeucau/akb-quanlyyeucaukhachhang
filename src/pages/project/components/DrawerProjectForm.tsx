import { Drawer, Form, Input, Button, Table, DatePicker, Select } from 'antd';
import { PlusOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import ModalUploadDocument from './ModalUploadDocument';
import type { IDocument } from '../interfaces/project.interface';
import dayjs from 'dayjs';
import { autoSeachCustomer, autoSearchPm } from '../services/project.service';
import { useDebounce } from '../../../common/hooks/useDebounce';
import { useSelector } from 'react-redux';
import { selectUserRole, selectUserProfile } from '../../../common/stores/auth/authSelector';
interface ICustomer {
  _id: string;
  name: string;
  alias: string;
}
interface IPM {
  _id: string;
  name: string;
  alias: string;
}

interface DrawerProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
}

const DrawerProjectForm: React.FC<DrawerProjectFormProps> = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [pmOptions, setPmOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchPmText, setSearchPmText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 400);
  const debouncedSearchPmText = useDebounce(searchPmText, 400);

  const userRole = useSelector(selectUserRole);
  const customerProfile = useSelector(selectUserProfile);
  const isCustomerRole = userRole === 'guest';

  const fetchCustomers = async (searchTerm: string) => {
    if (!isCustomerRole && open) {
      try {
        const response = await autoSeachCustomer(searchTerm);
        if (response.success && response.data) {
          const options = response.data.map((customer: ICustomer) => ({
            value: customer._id,
            label: `${customer.name} (${customer.alias})`
          }));
          setCustomerOptions(options);
        }
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomerOptions([]);
      }
    }
  };

  const fetchPMs = async (searchTerm: string) => {
    if (open) {
      try {
        const response = await autoSearchPm(searchTerm);
        if (response.success && response.data) {
          const options = response.data.map((pm: IPM) => ({
            value: pm._id,
            label: `${pm.name} (${pm.alias})`
          }));
          setPmOptions(options);
        }
      } catch (error) {
        console.error('Error searching PMs:', error);
        setPmOptions([]);
      }
    }
  };

  useEffect(() => {
    if (open && isCustomerRole && customerProfile) {
      form.setFieldValue('customer', customerProfile._id);
      setCustomerOptions([{
        value: customerProfile._id,
        label: `${customerProfile.name} (${customerProfile.alias})`
      }]);
    }
  }, [open, isCustomerRole, customerProfile, form]);

  const handleSearch = (value: string) => {
    if (!isCustomerRole && open) {
      setSearchText(value);
      fetchCustomers(value);
    }
  };

  const handleSearchPm = (value: string) => {
    if (open) {
      setSearchPmText(value);
      fetchPMs(value);
    }
  };

  const handleFocus = () => {
    if (!isCustomerRole && open && !searchText) {
      fetchCustomers('');
    }
  };

  const handlePmFocus = () => {
    if (open && !searchPmText) {
      fetchPMs('');
    }
  };

  const handleAddDocument = (document: IDocument) => {
    setDocuments([...documents, document]);
  };

  const handleClose = () => {
    if (!isCustomerRole) {
      form.resetFields();
    } else {
      const currentCustomer = form.getFieldValue('customer');
      form.resetFields();
      form.setFieldValue('customer', currentCustomer);
    }
    setDocuments([]);
    onClose();
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
      handleClose();
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
      onClose={handleClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            onClick={handleClose} 
            icon={<CloseOutlined />}
          >
            Đóng
          </Button>
          <Button 
            onClick={handleSave} 
            type="primary"
            icon={<SaveOutlined />}
          >
            Tạo yêu cầu dự án mới
          </Button>
        </div>
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
          rules={[{ required: true, message: 'Vui lòng chọn quản lý dự án!' }]}
        >
          <Select
            showSearch
            placeholder="Chọn PM"
            optionFilterProp="children"
            options={pmOptions}
            onSearch={handleSearchPm}
            onFocus={handlePmFocus}
            filterOption={false}
            notFoundContent={null}
            defaultActiveFirstOption={false}
            showArrow={false}
          />
        </Form.Item>

        <Form.Item
          name="customer"
          label="Khách hàng"
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
        >
          {isCustomerRole ? (
            <Select
              value={customerProfile?._id}
              options={customerOptions}
              disabled={true}
              style={{ cursor: 'not-allowed' }}
              open={false}
            />
          ) : (
            <Select
              showSearch
              placeholder="Tìm kiếm khách hàng"
              optionFilterProp="children"
              options={customerOptions}
              onSearch={handleSearch}
              onFocus={handleFocus}
              filterOption={false}
              notFoundContent={null}
              defaultActiveFirstOption={false}
              showArrow={false}
            />
          )}
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
      <ModalUploadDocument
        open={openModal}
        onClose={() => setOpenModal(false)}
        onUpload={handleAddDocument}
      />
    </Drawer>
  );
};

export default DrawerProjectForm;