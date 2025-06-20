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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('projectRequest');
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

  useEffect(() => {
    if (!isCustomerRole && open && debouncedSearchText !== undefined) {
      fetchCustomers(debouncedSearchText);
    }
  }, [debouncedSearchText, isCustomerRole, open]);

  useEffect(() => {
    if (open && debouncedSearchPmText !== undefined) {
      fetchPMs(debouncedSearchPmText);
    }
  }, [debouncedSearchPmText, open]);

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
    }
  };

  const handleSearchPm = (value: string) => {
    if (open) {
      setSearchPmText(value);
    }
  };

  const handleFocus = () => {
    if (!isCustomerRole && open && !searchText) {
      setSearchText('');
    }
  };

  const handlePmFocus = () => {
    if (open && !searchPmText) {
      setSearchPmText('');
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
      title: t('DrawerProjectForm.upedDoc_name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('DrawerProjectForm.upedDoc_Day'),
      dataIndex: 'day',
      key: 'day',
      render: (day: Date) => dayjs(day).format('DD/MM/YYYY'),
    },
    {
      title: t('DrawerProjectForm.upedDoc_files'),
      dataIndex: 'files',
      key: 'files',
      render: (files: any[]) => files.length,
    },
  ];

  return (
    <Drawer
      title= {t('DrawerProjectForm.drawertitle')}
      width={720}
      onClose={handleClose}
      open={open}
      styles={{ body: { paddingBottom: 80 } }}
      extra={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            onClick={handleClose} 
            icon={<CloseOutlined />}
          >
            {t('DrawerProjectForm.close')}
          </Button>
          <Button 
            onClick={handleSave} 
            type="primary"
            icon={<SaveOutlined />}
          >
            {t('DrawerProjectForm.drawertitle')}
          </Button>
        </div>
      }
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label= {t('DrawerProjectForm.pjname')}
          rules={[{ required: true, message: t('DrawerProjectForm.pjname_required') }]}
        >
          <Input placeholder= {t('DrawerProjectForm.pjname_placeholder')} />
        </Form.Item>

        <Form.Item
          name="pm"
          label= {t('DrawerProjectForm.PM')}
          rules={[{ required: true, message: t('DrawerProjectForm.PM_required') }]}
        >
          <Select
            showSearch
            placeholder= {t('DrawerProjectForm.PM_placeholder')}
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
          label= {t('DrawerProjectForm.customer')}
          rules={[{ required: true, message: t('DrawerProjectForm.customer_required') }]}
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
              placeholder= {t('DrawerProjectForm.customer_placeholder')}
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
          label= {t('DrawerProjectForm.startDate')}
          rules={[{ required: true, message: t('DrawerProjectForm.startDate_required') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label= {t('DrawerProjectForm.document')}>
          <Button icon={<PlusOutlined />} onClick={() => setOpenModal(true)}>
            {t('DrawerProjectForm.addDocument')}
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