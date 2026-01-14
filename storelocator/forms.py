# storelocator/forms.py

from django import forms


class AddressForm(forms.Form):
    """Address Search Form"""
    
    address = forms.CharField(
        label="",
        required=True,
        strip=True,  # Auto-strip whitespace
        widget=forms.TextInput(attrs={
            'id': 'address-input',
            'class': 'address-input',
            'placeholder': 'Enter your address',
            'autocomplete': 'off',
            'aria-label': 'Search for a store',
            'required': 'required',  # HTML5 validation
            'inputmode': 'text',
        })
    )
    
    def clean_address(self):
        """Validate address input"""
        address = self.cleaned_data.get('address', '').strip()
        
        if len(address) < 3:
            raise forms.ValidationError("Please enter a complete address.")
        
        return address