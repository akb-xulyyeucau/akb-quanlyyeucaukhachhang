import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, Space } from 'antd';
import { FilterOutlined, CloseCircleOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/vi_VN';
import type { Dayjs } from 'dayjs';

const { Option } = Select;

interface FilterValues {
  searchTerm: string;
  isDone?: boolean;
  timeFilterType: 'month' | 'quarter';
  selectedDate: Dayjs | null;
}

const defaultFilterValues: Partial<FilterValues> = {
  searchTerm: '',
  isDone: undefined,
  timeFilterType: 'month',
  selectedDate: null
};

interface ModalFilterProps {
  visible: boolean;
  onCancel: () => void;
  onFilter: (values: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
  loading?: boolean;
}

const ModalFilter: React.FC<ModalFilterProps> = ({
  visible,
  onCancel,
  onFilter,
  initialValues,
  loading = false
}) => {
  const [form] = Form.useForm();

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ ...defaultFilterValues, ...initialValues });
    }
  }, [visible, form, initialValues]);

  // Reset selectedDate when timeFilterType changes
  useEffect(() => {
    const timeFilterType = form.getFieldValue('timeFilterType');
    if (timeFilterType) {
      form.setFieldValue('selectedDate', null);
    }
  }, [form.getFieldValue('timeFilterType')]);

  const handleFilter = async () => {
    try {
      const values = await form.validateFields();
      
      // Build query string for logging
      const queryParams = new URLSearchParams();
      if (values.searchTerm) queryParams.append('searchTerm', values.searchTerm);
      if (values.isDone !== undefined) queryParams.append('isDone', values.isDone.toString());
      queryParams.append('page', '1');
      queryParams.append('limit', '10');
      
      if (values.selectedDate) {
        const timeFilter = {
          type: values.timeFilterType,
          year: values.selectedDate.year(),
          value: values.timeFilterType === 'month' 
            ? values.selectedDate.month() + 1 
            : Math.floor(values.selectedDate.month() / 3) + 1
        };
        queryParams.append('timeFilter', JSON.stringify(timeFilter));
      }

      console.log('Filter Query:', `?${queryParams.toString()}`);
      onFilter(values);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleReset = () => {
    // Reset all fields to default values
    form.resetFields();
    // Set timeFilterType to 'month' after reset
    form.setFieldsValue({
      timeFilterType: 'month',
      searchTerm: '',
      isDone: undefined,
      selectedDate: null
    });
  };

  // Handle timeFilterType change
  const handleTimeFilterTypeChange = (value: 'month' | 'quarter') => {
    form.setFieldsValue({ 
      timeFilterType: value,
      selectedDate: null 
    });
  };

  return (
    <Modal
      title="Bộ lọc dự án"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      afterClose={() => {
        form.resetFields();
      }}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultFilterValues}
        preserve={false}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="searchTerm"
              label="Tên dự án"
            >
              <Input
                placeholder="Nhập tên dự án"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isDone"
              label="Trạng thái"
            >
              <Select
                placeholder="Chọn trạng thái"
                allowClear
              >
                <Option value={true}>Đã hoàn thành</Option>
                <Option value={false}>Đang thực hiện</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="timeFilterType"
              label="Kiểu lọc thời gian"
            >
              <Select onChange={handleTimeFilterTypeChange}>
                <Option value="month">Theo tháng</Option>
                <Option value="quarter">Theo quý</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.timeFilterType !== currentValues.timeFilterType
              }
            >
              {({ getFieldValue }) => (
                <Form.Item
                  name="selectedDate"
                  label="Thời gian"
                >
                  <DatePicker
                    picker={getFieldValue('timeFilterType')}
                    format={getFieldValue('timeFilterType') === 'month' ? 'MM/YYYY' : '[Quý] Q/YYYY'}
                    locale={locale}
                    style={{ width: '100%' }}
                    allowClear
                  />
                </Form.Item>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Button
                type="primary"
                onClick={handleFilter}
                loading={loading}
                icon={<FilterOutlined />}
              >
                Lọc
              </Button>
              <Button 
                onClick={handleReset}
                icon={<CloseCircleOutlined />}
              >
                Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalFilter; 