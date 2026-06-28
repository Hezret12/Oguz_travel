import { Box, Typography } from "@mui/material"


export const CustomDialogHeader = ({ variant, title, color }) => {
    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: color ? color : undefined
            }}>
            <Typography variant={variant}>
                {title}
            </Typography>
        </Box>
    )
}