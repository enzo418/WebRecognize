import {CircularProgress, InputAdornment, Select, Slider, TextField} from '@mui/material';
import React from 'react';
import {GetFieldCallback, UpdateFieldCallback} from '../../context/configurationContext';
import _ from 'underscore';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface IConfigurationFieldProps {
    data: {
        path: string;
        camera?: string | number;

        updateCB: UpdateFieldCallback;
        getFieldCB: GetFieldCallback;
        
        /**
         * Helper function to format the received value.
         * This will be called after we get the value from the api and before we set it
         * to the internal state. It's expected to return the value to set, that means you 
         * can use it and return a modified/formatted value to save.
         */
        beforeSetValue?: (value: any) => string | number | object | boolean;

        /**
         * Helper function to format the value to send.
         * This function will be called after the user changed modified the value and before we send it
         * to the api to notify the change. It's expected to return the value to send, so you can use
         * it to validate/format the value before we send it.
         */
        beforeSendValue?: (value: any) => string | number | object | boolean;


        // onValueChanged is used to update live views or 
        // other component that depends on the current value of this configuration
        onValueChanged?: (newValue: any) => any;

        defaultValue?: any;
    };

    [x: string | number | symbol] : unknown; // indexer, allows extra properties
}

interface IConfigurationFieldState {
    value: string | number;
    state: 'initial' | 'updated' | 'updating' | 'error';
    errorMessage: string;
}

// Higher order component.
// Wraps an input so we don't need to handle the values and change events
// for each one.
// It only needs a data prop with the path of the field in the configuration file,
// the camera id (if it corresponds) and the update function.
export default function configurationField(
    WrappedComponent: any, fixProps: (p: any) => any) {
    // eslint-disable-next-line react/display-name
    return class extends React.Component<IConfigurationFieldProps, IConfigurationFieldState> {
        completePath:string;

        constructor(props:IConfigurationFieldProps) {
            super(props);
            this.handleChange = this.handleChange.bind(this);

            this.updateField = _.throttle(
                this.updateField.bind(this),
                300, {leading: false},
            );

            this.completePath = ""; // initialized when needed            

            this.state = {
                value: props.data.defaultValue ? props.data.defaultValue : '',
                state: 'initial',
                errorMessage: '',
            };
        }

        getValue() {
            this.completePath = this.props.data.camera !== undefined ?
                (`cameras/${this.props.data.camera}/`) : '';
            
            this.completePath += this.props.data.path;

            this.props.data.getFieldCB.apply(null, [this.completePath])
                .ok((r) => {
                    const formatted = this.props.data.beforeSetValue ? this.props.data.beforeSetValue(r) : r;

                    this.setState(({value: formatted, state: 'initial', errorMessage: ''}));

                    if (this.props.data.onValueChanged) {
                        this.props.data.onValueChanged(r);
                    }
                })
                .fail((e) => {
                    console.log('couldn\'t get the field value!', {error: e});
                });
        }

        componentDidMount() {
            this.getValue();
        }

        componentDidUpdate(prevProps:IConfigurationFieldProps) {
            // Typical usage (don't forget to compare props):
            if (this.props.data.camera !== prevProps.data.camera) {
                this.getValue();
            }
        }

        updateField(value:any) {
            const formatted = this.props.data.beforeSendValue ? this.props.data.beforeSendValue(value) : value;
            
            this.props.data.updateCB.apply(null, [this.completePath, formatted])
                .ok((_) => {
                    this.setState(({state: 'updated'}));

                    if (this.props.data.onValueChanged) {
                        this.props.data.onValueChanged(value);
                    }
                })

                // Here i might use some basic mapping between status codes to text,
                // translations based on codes given in e.code, etc.
                // although, backend translations based on language headers seems a better
                // option
                .fail((e) => {
                    console.log({error: e});
                    this.setState((
                        {
                            state: 'error',
                            errorMessage: e.invalidParams ?
                                e.invalidParams[this.props.data.path]?.reason : e.title || '',
                        }));
                });
        }

        handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            const inputType = e.target.type;

            const value = inputType == "number" ? e.target.valueAsNumber : e.target.value;
            this.setState(({
                value: value,
                state: 'updating',
                errorMessage: '',
            }));

            this.updateField(value);
        }

        getAdornment() {
            switch (this.state.state) {
            case 'error':
                return <ErrorOutlineIcon color="error"/>;
            case 'updated':
                return <DoneIcon color="success" />;
            case 'updating':
                return <CircularProgress
                    color="inherit"
                    sx={{maxWidth: '15px', maxHeight: '15px'}} />;
            }
        }

        render() {
            const {data, ...rest} = this.props;

            // Each component in mui has a different api
            const fixedProps = fixProps(
                {
                    error: this.state.state === 'error',
                    helperText: this.state.errorMessage,
                    value: this.state.value,
                    onChange: this.handleChange,
                    InputProps: {
                        endAdornment:
                            <InputAdornment position="end">
                                { this.getAdornment() }
                            </InputAdornment>,
                    },
                });

            return (<WrappedComponent
                {...fixedProps}
                {...rest}
            />);
        }
    };
}

export const TextConfigurationField = configurationField(TextField, (p) => p);
export const SelectConfigurationField = configurationField(Select, fixSelectProps);
export const SliderConfigurationField = configurationField(Slider, fixSliderProps);

function fixSliderProps(props:any) {
    const fixed = props;

    delete props.helperText;
    delete props.InputProps;
    delete props.error;

    return fixed;
}

function fixSelectProps(props:any) {
    const fixed = props;

    delete props.helperText;
    delete props.InputProps;

    return fixed;
}
