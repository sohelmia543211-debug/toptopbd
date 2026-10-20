// Supabase SDK Import
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Apnar Supabase Credentials Boshan
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // URL noise/bracket clean korar function
    const urlParams = new URLSearchParams(window.location.search);
    let rawId = urlParams.get('id') || '';
    
    // Extracted clean item_code (e.g., 56587)
    const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, '').trim();

    if (!cleanId) {
        renderError("Item ID pawya jayni!");
        return;
    }

    try {
        // Supabase 'gigs' table theke item_code diye fetch
        const { data, error } = await supabase
            .from('gigs')
            .select('*')
            .eq('item_code', cleanId)
            .single();

        if (error || !data) {
            renderError("Data pawa jayni ba ponno ti registered noy.");
            return;
        }

        renderVerificationCard(data);
    } catch (err) {
        renderError("Server error! Abar chesta korun.");
    }
});

function renderVerificationCard(data) {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="card-header">
            <div class="badge-icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2>Officially Verified Product</h2>
            <div class="status-badge">
                <i class="fa-solid fa-check"></i> 100% Original & Registered
            </div>
        </div>

        ${data.image_url ? `
        <div class="verified-image-container">
            <img src="${data.image_url}" alt="${data.gig_title || 'Product Image'}" class="verified-img" onerror="this.style.display='none'">
        </div>` : ''}

        <div class="card-body">
            <div class="info-group">
                <span class="label">Product / Service Name:</span>
                <span class="value">${data.gig_title || 'N/A'}</span>
            </div>
            <div class="info-group">
                <span class="label">Categories:</span>
                <span class="value">${data.category || 'N/A'}</span>
            </div>
            <div class="info-group">
                <span class="label">Sub-categories:</span>
                <span class="value">${data.subCategory || data.sub_category || 'N/A'}</span>
            </div>
            <div class="info-group">
                <span class="label">Code / Reg No:</span>
                <span class="value">${data.item_code}</span>
            </div>
            ${data.price ? `
            <div class="info-group">
                <span class="label">Price:</span>
                <span class="value price-tag">৳ ${data.price}</span>
            </div>` : ''}
            <div class="info-group">
                <span class="label">Merchant / Organization:</span>
                <span class="value">${data.verifiedBy || data.merchant_name || 'TopTopBD Official'}</span>
            </div>
            <div class="info-group">
                <span class="label">Verification Date:</span>
                <span class="value">${data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>
    `;
}

function renderError(message) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="state-container">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: #ef4444; margin-bottom: 12px;"></i>
            <h3 style="color: #ef4444; margin-bottom: 8px;">Verification Failed</h3>
            <p style="color: #64748b;">${message}</p>
        </div>
    `;
}