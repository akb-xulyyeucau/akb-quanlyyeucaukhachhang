import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, Space } from 'antd';
import { FilterOutlined, CloseCircleOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/vi_VN';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('project');

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ ...defaultFilterValues, ...initialValues });
    }
  }, [visible, form, initialValues]);

  useEffect(() => {
    const timeFilterType = form.getFieldValue('timeFilterType');
    if (timeFilterType) {
      form.setFieldValue('selectedDate', null);
    }
  }, [form.getFieldValue('timeFilterType')]);

  const handleFilter = async () => {
    try {
      const values = await form.validateFields();
      onFilter(values);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({
      timeFilterType: 'month',
      searchTerm: '',
      isDone: undefined,
      selectedDate: null
    });
  };

  const handleTimeFilterTypeChange = (value: 'month' | 'quarter') => {
    form.setFieldsValue({
      timeFilterType: value,
      selectedDate: null
    });
  };

  return (
    <Modal
      title={t('projectPage.filter')}
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
              label={t('projectPage.projectName')}
            >
              <Input
                placeholder={t('ModalFilter.enterProjectName')}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isDone"
              label={t('projectPage.status')}
            >
              <Select
                placeholder={t('ModalFilter.selectStatus')}
                allowClear
              >
                <Option value={true}>{t('projectPage.completed')}</Option>
                <Option value={false}>{t('projectPage.inProgress')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="timeFilterType"
              label={t('ModalFilter.timeFilterType')}
            >
              <Select onChange={handleTimeFilterTypeChange}>
                <Option value="month">{t('ModalFilter.byMonth')}</Option>
                <Option value="quarter">{t('ModalFilter.byQuarter')}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) => prev.timeFilterType !== current.timeFilterType}
            >
              {({ getFieldValue }) => (
                <Form.Item
                  name="selectedDate"
                  label={t('projectPage.time')}
                >
                  <DatePicker
                    picker={getFieldValue('timeFilterType')}
                    format={getFieldValue('timeFilterType') === 'month' ? 'MM/YYYY' : '[Q]Q/YYYY'}
                    locale={locale}
                    style={{ width: '100%' }}
                    allowClear
                    placeholder={
                      getFieldValue('timeFilterType') === 'month'
                        ? t('ModalFilter.placeholderMonth')
                        : t('ModalFilter.placeholderQuarter')
                    }
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
                {t('projectPage.filter')}
              </Button>
              <Button
                onClick={handleReset}
                icon={<CloseCircleOutlined />}
              >
                {t('ModalFilter.reset')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalFilter;
